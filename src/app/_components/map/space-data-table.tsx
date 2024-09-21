import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Hash, Cloud, Sun, CaretDown, ArrowRight } from "@phosphor-icons/react";
import { cn } from "~/lib/utils";
import { useSpaceData } from "~/lib/useSpaceData";
import { usePosition } from "./user-position";

interface SpaceDataTableProps {
  inline?: boolean;
}

const WaveText = ({
  text,
  height = 21,
  waveHeight = 3,
  color = "#1BC48B",
  gradientColor = "#8DAA9E",
  padding = 0,
}: {
  text: string;
  height?: number;
  waveHeight?: number;
  color?: string;
  gradientColor?: string;
  padding?: number;
}) => {
  const textRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (textRef.current) {
      const bbox = textRef.current.getBBox();
      setWidth(bbox.width + padding * 2); // Add padding on both sides
    }
  }, [text, padding]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      <defs>
        <linearGradient id="gradientWave" x1="0" x2="0" y1="0" y2="1">
          <stop offset="5%" stopColor={gradientColor}></stop>
          <stop offset="95%" stopColor={gradientColor}></stop>
        </linearGradient>
        <pattern
          id="wave"
          x="0"
          y={waveHeight}
          width="120"
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            id="wavePath"
            d={`M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V${height} H-40z`}
            mask="url(#mask)"
            fill={color}
          >
            <animateTransform
              attributeName="transform"
              begin="0s"
              dur="1.5s"
              type="translate"
              from="0,0"
              to="40,0"
              repeatCount="indefinite"
            ></animateTransform>
          </path>
        </pattern>
      </defs>
      <text
        ref={textRef}
        textAnchor="middle"
        fontSize="14px"
        x="50%"
        y={height - 5}
        fill="url(#wave)"
        fillOpacity="1.0"
      >
        {text}
      </text>
      <text
        textAnchor="middle"
        fontSize="14px"
        x="50%"
        y={height - 5}
        fill="url(#gradientWave)"
        fillOpacity="0.6"
      >
        {text}
      </text>
    </svg>
  );
};

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const getKpIndexDescription = (kpi: number) => {
  const descriptions = [
    {
      threshold: 0,
      text: "auroras are mostly confined to high latitudes, and visibility is minimal.",
    },
    {
      threshold: 1,
      text: "faint auroras may be visible in northern skies.",
    },
    { threshold: 2, text: "auroras become brighter and more dynamic." },
    {
      threshold: 3,
      text: "bright auroras visible overhead, often pale green.",
    },
    { threshold: 4, text: "bright, colorful displays are common." },
    {
      threshold: 5,
      text: "vibrant colors including red and purple may appear.",
    },
    {
      threshold: 6,
      text: "dynamic displays that are memorable.",
    },
    {
      threshold: 7,
      text: "visible in southern skies, with a high likelihood of colorful displays.",
    },
    {
      threshold: 8,
      text: "auroras can be seen around 50° latitude.",
    },
    {
      threshold: 9,
      text: "possible visibility as far south as 40° latitude, with vivid red auroras likely.",
    },
  ];

  const description =
    descriptions.find((desc, index) => kpi < index + 1) ||
    descriptions[descriptions.length - 1];
  return description.text;
};

export const SpaceDataTable = ({ inline = false }: SpaceDataTableProps) => {
  const [expanded, setExpanded] = React.useState(inline);
  const { kpi, cloudCoverage, solarWindSpeed } = useSpaceData();
  const { position } = usePosition();

  return (
    <motion.div
      className={cn(
        "border border-border bg-input px-3 py-3 text-xs text-muted-foreground",
        expanded ? "w-60 rounded-xl" : "rounded-full",
        !inline && "absolute right-20 top-5",
      )}
      onClick={() => !inline && setExpanded(!expanded)}
    >
      {!inline && (
        <div className="flex items-center justify-between gap-2">
          <span>Real-time space data</span>
          <CaretDown size={16} />
        </div>
      )}
      {expanded && (
        <div className={cn("flex flex-col gap-3", !inline && "mt-2")}>
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Hash size={20} weight="duotone" className="text-[#7AEBC6]" />
                KP Index
              </div>
              <span className="text-start">{getKpIndexDescription(kpi)}</span>
            </div>
            <span className="text-sm">{kpi}</span>
          </div>
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Cloud size={20} weight="duotone" className="text-[#7AEBC6]" />
                Cloud coverage
              </div>
              <span>
                {!position ? (
                  <span className="flex items-center gap-1">
                    Enable GPS location
                    <ArrowRight size={14} className="-rotate-[35deg]" />
                  </span>
                ) : cloudCoverage > 50 ? (
                  "a bit too high to be fair"
                ) : cloudCoverage >= 0 ? (
                  "you should be able to see it"
                ) : (
                  "no"
                )}
              </span>
            </div>
            <WaveText
              text={!position ? "?" : `${cloudCoverage}%`}
              waveHeight={mapRange(cloudCoverage, 100, 0, 12, -4)}
              color={!position ? "#C81D1D" : undefined}
            />
          </div>
          <div className="flex justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Sun size={20} weight="duotone" className="text-[#7AEBC6]" />
                Solar Wind Speed
              </div>
              <span>the faster the better</span>
            </div>
            <span className="text-sm">{solarWindSpeed}km/s</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
