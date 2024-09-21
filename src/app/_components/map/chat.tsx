import React, { useEffect, useMemo, useState } from "react";
import {
  ChatTeardropDots,
  Check,
  CircleNotch,
  Gps,
  GpsFix,
} from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { usePosition } from "./user-position";
import { SpaceDataTable } from "./space-data-table";
import { useSpaceData } from "~/lib/useSpaceData";
import { getLocationInfo, getPrettyLocationName, LocationInfo } from "./drawer";

const buttonLocation = {
  idle: (
    <>
      <Gps size={24} weight="duotone" />
      Enable location
    </>
  ),
  loading: <CircleNotch size={24} weight="duotone" />,
  success: (
    <>
      <Check size={24} weight="duotone" />
      Location enabled
    </>
  ),
};

const isMobile = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent) || window.innerWidth <= 768;
};

export const Chat = ({ snap }) => {
  const {
    position,
    loading: loadingPosition,
    handleGetPosition,
  } = usePosition();
  const { loading } = useSpaceData();

  const [open, setOpen] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  const [location, setLocation] = useState<LocationInfo | null>(null);

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
    const handleResize = () => setIsMobileDevice(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const variants = useMemo(
    () => ({
      closed: (snap) => ({
        y:
          snap === "150px"
            ? isMobileDevice
              ? -188
              : -98
            : isMobileDevice
              ? -288
              : -208,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      }),
      open: {
        y: isMobileDevice ? 54 : -6,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: 0.2,
        },
      },
    }),
    [isMobileDevice],
  );

  useEffect(() => {
    if (!position) {
      setButtonState("idle");
    } else if (loadingPosition) {
      setButtonState("loading");
    } else {
      const id = setTimeout(() => {
        setButtonState("success");
      }, 1000);

      return () => clearTimeout(id);
    }
  }, [position, loadingPosition]);

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
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.div
          key="closed"
          className="absolute bottom-0 left-1.5"
          variants={variants}
          custom={snap}
          initial="closed"
          animate="closed"
          exit="exit"
          layoutId="chat"
        >
          <Button
            className="items-center gap-2"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <ChatTeardropDots weight="duotone" size="24" /> Can I see the
            northern lights?
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="open"
          className="absolute bottom-0 left-1.5 z-[70] h-full max-h-[calc(100vh-80px)] w-[calc(100%-12px)] overflow-auto rounded-lg border border-border bg-card p-4 text-center"
          variants={variants}
          initial="closed"
          animate="open"
          exit="exit"
          layoutId="chat"
        >
          <span className="mb-3 ml-auto block w-fit max-w-[240px] rounded-md bg-muted/25 p-2">
            Can I see the northern lights?
          </span>
          <motion.span
            className="mb-3 mr-auto block w-fit max-w-[240px] rounded-md border border-border p-2 text-start text-primary-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.5,
            }}
          >
            Sure thing, can you first turn on and allow reading your location so
            I can estimate your aurora chance?
          </motion.span>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.5,
            }}
          >
            <Button
              variant="outline"
              onClick={() => handleGetPosition({ shouldRequest: true })}
              className="mb-3 flex items-center gap-2"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 }}
                  key={buttonState}
                  className="flex items-center gap-2"
                >
                  {buttonLocation[buttonState]}
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
          {position &&
            buttonState === "success" &&
            (loading.kpi ||
              loading.cloudCoverage ||
              loading.solarWindSpeed) && (
              <motion.span
                className="mb-3 flex items-center gap-2 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 1.5,
                }}
              >
                <CircleNotch
                  size={24}
                  weight="duotone"
                  className="animate-spin"
                />
                Gathering weather data
              </motion.span>
            )}
          {position && buttonState === "success" && (
            <motion.span
              className="mb-3 mr-auto block w-fit max-w-[240px] rounded-md border border-border p-2 text-start text-primary-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 2.5,
              }}
            >
              Awesome, I see you&apos;re hunting the northern lights near
              <span className="my-2 flex items-start gap-2 text-primary">
                <GpsFix size={24} weight="duotone" className="shrink-0" />
                {prettyLocationName}
              </span>
              Here&apos;s a detailed report on your likelihood of seeing an
              aurora now.
            </motion.span>
          )}
          {!loading.kpi &&
            !loading.cloudCoverage &&
            !loading.solarWindSpeed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 3,
                }}
                className="mb-16"
              >
                <SpaceDataTable inline />
              </motion.div>
            )}
        </motion.div>
      )}
      {open && (
        <div
          className="absolute left-0 top-0 z-[60] h-full w-full bg-background/50"
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default Chat;
