"use client";
import { useUser } from "@clerk/nextjs";
import { cn } from "~/lib/utils";
import { Avatar } from "./auth/avatar";
import { UserPosition, userPositionAtom } from "./map/user-position";
import { Angle, CaretDown, Cloud, Hash, Sun } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";

export const Navigation = () => {
  const [expanded, setExpanded] = useState(false);
  const { isSignedIn } = useUser();

  const position = useAtomValue(userPositionAtom);

  const [kpi, setKpi] = useState(0);
  const [cloudCoverage, setCloudCoverage] = useState(0);
  const [solarWindSpeed, setSolarWindSpeed] = useState(0);

  useEffect(() => {
    const fetchKpIndex = async () => {
      try {
        const response = await fetch(
          "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
        );
        const data = (await response.json()) as unknown[];

        // The first row contains headers, so we get the last row for the most recent data
        const latestData = data[data.length - 1];
        console.log(data, latestData);
        // The Kp index is the second item in each row
        const latestKpIndex = parseFloat(latestData[1]);

        setKpi(latestKpIndex);
      } catch (err) {
        console.error("Error fetching Kp index:", err);
      }
    };

    fetchKpIndex().catch((err) =>
      console.error("Error fetching Kp index:", err),
    );
  }, []);

  useEffect(() => {
    const fetchCloudCoverage = async () => {
      if (!position) return;

      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=cloud_cover&hourly=cloud_cover&forecast_days=1`,
        );
        const data = (await response.json()) as unknown;

        const currentCloudCoverage = data.current.cloud_cover;

        setCloudCoverage(currentCloudCoverage);
      } catch (err) {
        console.error("Error fetching cloud coverage:", err);
      }
    };

    fetchCloudCoverage().catch((err) =>
      console.error("Error fetching cloud coverage:", err),
    );
  }, [position]);

  useEffect(() => {
    const fetchSolarWindSpeed = async () => {
      try {
        const response = await fetch(
          "https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json",
        );
        const data = await response.json();

        // The first row contains headers, so we get the last row for the most recent data
        const latestData = data[data.length - 1];
        // The solar wind speed is the 3rd item (index 2) in each row
        const latestSolarWindSpeed = parseFloat(latestData[2]);

        setSolarWindSpeed(latestSolarWindSpeed);
      } catch (err) {
        console.error("Error fetching solar wind speed:", err);
      }
    };

    fetchSolarWindSpeed().catch((err) =>
      console.error("Error fetching solar wind speed:", err),
    );
  }, []);

  return (
    <nav className={cn("p-5", !isSignedIn && "bg-card")}>
      <span className="mb-3 block font-serif text-2xl">ōrora</span>
      {isSignedIn && <Avatar />}
      <motion.div
        className={cn(
          "absolute right-20 top-5 border border-border bg-input px-3 py-3 text-xs text-muted-foreground",
          expanded ? "w-60 rounded-xl" : "rounded-full",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between gap-2">
          <span>Real-time space data</span>
          <CaretDown size={16} />
        </div>
        {expanded && (
          <div className="mt-2 flex flex-col gap-3">
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash size={20} weight="duotone" />
                  KP Index
                </div>
                <span>aurora is just around the corner</span>
              </div>
              <span className="text-sm">{kpi}</span>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Cloud size={20} weight="duotone" />
                  Cloud coverage{" "}
                </div>
                <span>
                  {cloudCoverage > 50
                    ? "a bit too high to be fair"
                    : cloudCoverage >= 0
                      ? "you should see it"
                      : "no"}
                </span>
              </div>
              <span className="text-sm">{cloudCoverage}%</span>
            </div>
            <div className="flex justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <Sun size={20} weight="duotone" />
                  Solar Wind Speed
                </div>
                <span>the faster the better</span>
              </div>
              <span className="text-sm">{solarWindSpeed}km/s</span>
            </div>
          </div>
        )}
      </motion.div>
      <div className="absolute right-5 top-5">
        <UserPosition />
      </div>
    </nav>
  );
};
