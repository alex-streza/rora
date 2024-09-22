import {
  ChatTeardropDots,
  Check,
  CircleNotch,
  Gps,
  GpsFix,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTimeout } from "usehooks-ts";
import { Button } from "~/components/ui/button";
import { useSpaceData } from "~/lib/useSpaceData";
import { getLocationInfo, getPrettyLocationName, LocationInfo } from "./drawer";
import { SpaceDataTable } from "./space-data-table";
import { useNavigatorPermission, usePosition } from "./user-position";

const buttonLocation = {
  idle: (
    <>
      <Gps size={24} weight="duotone" />
      Enable location
    </>
  ),
  loading: <CircleNotch size={24} weight="duotone" />,
  success: (
    <span className="flex items-center gap-2 text-primary">
      <Check size={24} weight="duotone" />
      Location enabled
    </span>
  ),
};

const isMobile = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent;
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return mobileRegex.test(userAgent) || window.innerWidth <= 768;
};

const loadingTexts = [
  "gathering weather data",
  "fetching aurora forecast",
  "calculating visibility",
  "almost done",
  "",
];

export const Chat = () => {
  const {
    position,
    loading: loadingPosition,
    handleGetPosition,
  } = usePosition();
  const { loading } = useSpaceData();

  const { disabled: locationDisabled } = useNavigatorPermission();

  const [open, setOpen] = useState(false);
  const [buttonState, setButtonState] = useState("idle");
  const [location, setLocation] = useState<LocationInfo | null>(null);

  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const index = useRef(0);

  useTimeout(() => {
    const interval = setInterval(() => {
      if (!open || !position || locationDisabled) return;

      if (index.current === loadingTexts.length - 1) return;

      index.current = index.current + 1;
      setLoadingText(loadingTexts[index.current]);
    }, 1500);

    if (index.current === loadingTexts.length - 1) clearInterval(interval);

    return () => clearInterval(interval);
  }, 4000);

  useEffect(() => {
    setLoadingText(loadingTexts[0]);
    index.current = 0;
  }, [open]);

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
    <AnimatePresence mode="wait" initial={false}>
      {!open ? (
        <motion.div key="closed" layoutId="chat-message">
          <Button
            className="items-center gap-2"
            variant="secondary"
            onClick={() => setOpen(true)}
          >
            <ChatTeardropDots weight="duotone" size="24" />
            Can I see the northern lights?
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="open"
          className="fixed bottom-0 left-1/2 z-[70] h-full max-h-[calc(100vh-80px)] w-[calc(100%-12px)] max-w-md -translate-x-1/2 overflow-auto rounded-lg border border-border bg-card p-4 text-center"
          animate="open"
        >
          <motion.span
            className="mb-3 ml-auto block w-fit max-w-[240px] rounded-md bg-muted/25 p-2"
            layoutId="chat-message"
          >
            Can I see the northern lights?
          </motion.span>
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
          {position && buttonState === "success" && loadingText !== "" && (
            <motion.span
              className="mb-3 flex items-center gap-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: locationDisabled ? 1 : 2,
              }}
            >
              <CircleNotch
                size={24}
                weight="duotone"
                className="animate-spin"
              />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  initial={{ opacity: 0, y: -25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 25 }}
                  className="w-60 text-start"
                  key={loadingText}
                >
                  {loadingText}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          )}
          {position && buttonState === "success" && (
            <motion.span
              className="mb-3 mr-auto block w-fit max-w-[240px] rounded-md border border-border p-2 text-start text-primary-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: locationDisabled ? 1 : 7,
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
                  delay: locationDisabled ? 2 : 7.5,
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
          className="fixed left-0 top-0 z-[60] h-full w-full bg-background/50"
          onClick={() => setOpen(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default Chat;
