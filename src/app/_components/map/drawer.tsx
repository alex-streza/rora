"use client";

import { SignedIn } from "@clerk/nextjs";
import { Image as ImageIcon, MagnifyingGlass } from "@phosphor-icons/react";
import { distance, point } from "@turf/turf";
import { motion } from "framer-motion";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import spacetime from "spacetime";
import { useDebounceValue } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { viewStateAtom } from ".";
import { Chat } from "./chat";
import { SubmitSighting } from "./submit-sighting";
import { userPositionAtom } from "./user-position";

export const searchAtom = atom("");

export interface LocationInfo {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

export function getPrettyLocationName(locationInfo: LocationInfo): string {
  const { address } = locationInfo;

  // Priority order for local area name
  const localName =
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.suburb ??
    "";

  // Construct the display name
  const displayParts = [];

  if (localName) displayParts.push(localName);
  if (address.county && address.county !== localName)
    displayParts.push(address.county);
  if (address.state && address.state !== address.county)
    displayParts.push(address.state);
  if (address.country) displayParts.push(address.country);

  // Join the parts, but limit to 3 for brevity
  return displayParts.slice(0, 3).join(", ");
}

export async function getLocationInfo(
  latitude: number,
  longitude: number,
): Promise<LocationInfo | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = (await response.json()) as LocationInfo;
    return data;
  } catch (error) {
    console.error("Error fetching location info:", error);
    return null;
  }
}

export function SightingsDrawer() {
  const [snap, setSnap] = useState<number | string | null>("260px");
  const [search, setSearch] = useAtom(searchAtom);

  const setViewState = useSetAtom(viewStateAtom);

  const position = useAtomValue(userPositionAtom);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  const [debouncedSearch] = useDebounceValue(search, 500);

  const { data } = api.aurora.getLatest.useQuery({
    search: debouncedSearch,
  });

  const sightings = useMemo(() => {
    if (!position) return data ?? [];

    const point1 = point([position.coords.longitude, position.coords.latitude]);

    return data?.map((sighting) => {
      const point2 = point([sighting.longitude, sighting.latitude]);
      const distanceInKm = distance(point1, point2);

      return {
        ...sighting,
        distance: Math.round(distanceInKm * 100) / 100,
      };
    });
  }, [data, position]);

  useEffect(() => {
    if (!position) return;

    getLocationInfo(position.coords.latitude, position.coords.longitude)
      .then((location) => {
        setLocation(location);
      })
      .catch((error) => {
        console.error("Error fetching location info:", error);
      });
  }, [position]);

  const prettyLocationName = useMemo(() => {
    return location ? getPrettyLocationName(location) : null;
  }, [location]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Chat snap={snap} />
      </motion.div>
      <SignedIn>
        <Dialog>
          <DialogTrigger asChild>
            <motion.div
              className={cn(
                "absolute bottom-0 right-1.5",
                snap === "150px" ? "-translate-y-24" : "-translate-y-52",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button size="icon" className="rounded-full">
                <ImageIcon weight="duotone" size="24" />
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <SubmitSighting location={prettyLocationName} />
          </DialogContent>
        </Dialog>
      </SignedIn>
      <Drawer
        snapPoints={["150px", "260px", 1]}
        activeSnapPoint={snap}
        setActiveSnapPoint={setSnap}
        noBodyStyles
        open
      >
        <DrawerContent className="outline-me flex h-full max-h-[90%] flex-col px-5">
          <div
            className="relative mt-3"
            onClick={(e) => {
              setSnap(1);
            }}
          >
            <MagnifyingGlass
              size={24}
              weight="duotone"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <Input
              placeholder="Search..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="mt-5 flex flex-col gap-2">
            {sightings?.slice(0, 10).map((sighting) => (
              <button
                key={sighting.id}
                className="flex items-center gap-2"
                onClick={() =>
                  setViewState((viewState) => ({
                    ...viewState,
                    latitude: sighting.latitude,
                    longitude: sighting.longitude,
                    zoom: 3,
                  }))
                }
                type="button"
              >
                <div className="flex aspect-square h-10 w-10 items-center gap-2 overflow-hidden rounded-full">
                  <Image
                    src={sighting.imageUrl}
                    alt={sighting.location}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="flex flex-col gap-1 text-start">
                  <span>
                    Aurora sighted at{" "}
                    <span className="font-medium">{sighting.location}</span>
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span>
                      {
                        spacetime(sighting.createdAt).fromNow(new Date())
                          .qualified
                      }
                    </span>
                    <span>•</span>
                    <span>{sighting.distance} km away</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
