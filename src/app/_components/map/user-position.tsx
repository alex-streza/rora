"use client";
import { GpsFix } from "@phosphor-icons/react";
import { atom, useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";

export const userPositionAtom = atom<GeolocationPosition | null>(null);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const UserPosition = () => {
  const [position, setPosition] = useAtom(userPositionAtom);

  const handleGetPosition = useCallback(
    async ({ shouldRequest = true }) => {
      console.log("handleGetPosition ->", position);
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        console.log("permission ->", permission);
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
    >
      <GpsFix size={24} weight="duotone" />
    </Button>
  );
};
