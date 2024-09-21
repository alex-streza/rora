"use client";

import { Panorama, User } from "@phosphor-icons/react";
import { distance, point } from "@turf/turf";
import { motion, AnimatePresence } from "framer-motion";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef } from "react";
import type { MapRef, ViewState } from "react-map-gl";
import Map, { Layer, Marker, Source } from "react-map-gl";
import spacetime from "spacetime";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { env } from "~/env";
import { api } from "~/trpc/react";
import { SubmitSighting } from "./submit-sighting";
import { userPositionAtom } from "./user-position";

type Feature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    aurora: number;
    observationTime: string;
    forecastTime: string;
  };
};

type GeoJsonData = {
  type: "FeatureCollection";
  features: Feature[];
};

const dataAtom = atomWithStorage<{
  lastFetchedAt: number;
  value?: GeoJsonData;
}>("geojson-data", {
  lastFetchedAt: new Date().getTime(),
});

const Layers = () => {
  const [data, setData] = useAtom(dataAtom);

  useEffect(() => {
    if (new Date().getTime() - data.lastFetchedAt > 300000) {
      return;
    }

    fetch(
      "https://avpiytgvzfbbfmnmycdj.supabase.co/storage/v1/object/public/geojsons/aurora_forecast.geojson",
    )
      .then((res) => res.json())
      .then((data: GeoJsonData) => {
        if (data) {
          setData({
            lastFetchedAt: new Date().getTime(),
            value: data,
          });
        }
      })
      .catch((err) => console.error(err));
  }, [setData]);

  const auroraLayer = {
    id: "aurora-layer",
    type: "circle",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        10,
        4,
        50,
        8,
        100,
      ],
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "aurora"],
        2,
        "rgba(0, 0, 0, 0)",
        3,
        "rgba(15, 46, 39, 0.3)",
        6,
        "rgba(46, 137, 107, 0.3)",
        9,
        "rgba(110, 206, 174, 0.3)",
      ],
      "circle-blur": 0.2,
      "circle-opacity": 0.2,
    },
    filter: ["<=", ["zoom"], 10],
  };

  return (
    <>
      {data && (
        <Source type="geojson" data={data.value}>
          <Layer {...auroraLayer} />
        </Source>
      )}
    </>
  );
};

function getBoundingBox(viewport: ViewState) {
  const { longitude, latitude, zoom } = viewport;

  // Approximate the visible area
  const offset = 360 / (Math.pow(2, zoom) * 2);

  return {
    minLon: longitude - offset,
    maxLon: longitude + offset,
    minLat: latitude - offset,
    maxLat: latitude + offset,
  };
}

export const viewStateAtom = atom<ViewState>({
  latitude: 69.6492,
  longitude: 18.9553,
  zoom: 3,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
  pitch: 0,
});

export default function AuroraMap() {
  const mapRef = useRef<MapRef>(null);

  const position = useAtomValue(userPositionAtom);

  const since = useMemo(() => spacetime().add(-1, "day").toNativeDate(), []);

  const { data } = api.aurora.getLatest.useQuery({
    since,
  });

  const [viewState, setViewState] = useAtom(viewStateAtom);

  useEffect(() => {
    if (position) {
      setViewState((viewState) => ({
        ...viewState,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        zoom: 8,
      }));
    }
  }, [position]);

  const sightings = useMemo(() => {
    if (!data || !viewState) return [];

    // Calculate the viewport bounding box
    const bbox = getBoundingBox(viewState);

    // Filter sightings within the viewport
    const filteredSightings = data.filter((feature) => {
      const [lon, lat] = [feature.longitude, feature.latitude];
      return (
        lon >= bbox.minLon &&
        lon <= bbox.maxLon &&
        lat >= bbox.minLat &&
        lat <= bbox.maxLat
      );
    });

    if (position) {
      const point1 = point([
        position.coords.longitude,
        position.coords.latitude,
      ]);

      return data.map((sighting) => {
        const point2 = point([sighting.longitude, sighting.latitude]);
        const distanceInKm = distance(point1, point2);

        return {
          ...sighting,
          distance: Math.round(distanceInKm * 100) / 100,
        };
      });
    }

    return filteredSightings.map((sighting) => ({
      ...sighting,
      distance: undefined,
    }));
  }, [data, position, viewState]);

  return (
    <div className="absolute inset-0 h-screen w-screen">
      <div className="relative h-full w-full">
        <Map
          {...viewState}
          mapStyle="mapbox://styles/alex-snowfox/cm0zstydj01cp01o3hyyh9rlb"
          mapboxAccessToken={env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onMove={(evt) => setViewState(evt.viewState)}
          ref={mapRef}
        >
          <AnimatePresence>
            {viewState.zoom > 3 &&
              sightings.map((sighting) => (
                <Marker
                  key={sighting.id}
                  latitude={sighting.latitude}
                  longitude={sighting.longitude}
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        className="outline-me rounded-full border-border bg-[#5A776B] p-2 text-[#18201D]"
                        initial={{
                          scale: 0.5,
                          opacity: 0,
                        }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                        }}
                        exit={{
                          scale: 0.5,
                          opacity: 0,
                        }}
                      >
                        <Panorama size={24} weight="duotone" />
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent>
                      <SubmitSighting
                        location={sighting.location}
                        url={sighting.imageUrl}
                        distance={sighting.distance}
                        createdAt={sighting.createdAt}
                      />
                    </DialogContent>
                  </Dialog>
                </Marker>
              ))}
          </AnimatePresence>
          {position && (
            <Marker
              latitude={position.coords.latitude}
              longitude={position.coords.longitude}
            >
              <div className="rounded-full border-border bg-card p-2 text-muted">
                <User size={24} weight="duotone" />
              </div>
            </Marker>
          )}
          {viewState.zoom < 3 && <Layers />}
        </Map>
      </div>
    </div>
  );
}
