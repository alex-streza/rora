"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { distance, point } from "@turf/turf";
import Image from "next/image";
import { useMemo, useState } from "react";
import spacetime from "spacetime";
import { Drawer, DrawerContent } from "~/components/ui/drawer";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { userPositionAtom } from "./user-position";
import { useAtom } from "jotai";
import { useDebounceValue } from "usehooks-ts";

export function SightingsDrawer() {
  const [snap, setSnap] = useState<number | string | null>("260px");
  const [search, setSearch] = useDebounceValue("", 500);

  const [position, setPosition] = useAtom(userPositionAtom);

  const { data } = api.aurora.getLatest.useQuery({
    search,
  });

  const sightings = useMemo(() => {
    if (!data || !position) return null;

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

  return (
    <Drawer
      snapPoints={["260px", 1]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      noBodyStyles
      open
    >
      <DrawerContent className="flex h-full max-h-[90%] flex-col px-5">
        <div className="relative mt-3">
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
          {sightings?.map((sighting) => (
            <div key={sighting.id} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={sighting.imageUrl}
                  alt={sighting.location}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span>
                  Aurora sighted at{" "}
                  <span className="underline">{sighting.location}</span>
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
                  {/* <span>•</span>
                  <span>12 reports</span> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
