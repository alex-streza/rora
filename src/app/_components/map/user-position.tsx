"use client";
import { CircleNotch, GpsFix } from "@phosphor-icons/react";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "~/components/ui/button";

export const userPositionAtom = atom<GeolocationPosition | null>(null);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const UserPosition = () => {
  const [position, setPosition] = useAtom(userPositionAtom);
  const [loading, setLoading] = useState(false);

  const handleGetPosition = useCallback(
    async ({ shouldRequest = true }) => {
      setLoading(true);
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        if (permission.state === "granted") {
          navigator.geolocation.getCurrentPosition(
            (position) => setPosition(position),
            (error) => console.error("Error:", error),
          );
        } else if (shouldRequest) {
          navigator.permissions
            .query({ name: "geolocation" })
            .then((permissionStatus) => {
              if (permissionStatus.state === "denied") {
                alert("Please allow location access.");
                window.location.href = "app-settings:location";
              } else {
                navigator.geolocation.getCurrentPosition((position) =>
                  setPosition(position),
                );
              }
            })
            .catch((error) => console.error("Error:", error));
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    },
    [position, setPosition],
  );

  useEffect(() => {
    handleGetPosition({ shouldRequest: false }).then(noop).catch(noop);
  }, []);

  return (
    <Button
      size="icon"
      variant={position ? "default" : "outline"}
      className="rounded-full"
      onClick={() => handleGetPosition({ shouldRequest: true })}
      disabled={loading}
    >
      {!loading && <GpsFix size={24} weight="duotone" />}
      {loading && (
        <CircleNotch size={24} weight="duotone" className="animate-spin" />
      )}
    </Button>
  );
};
