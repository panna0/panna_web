"use client";

import { useId } from "react";
import { motion, type MotionValue } from "framer-motion";

type PullThreadProps = {
  d: string | MotionValue<string>;
  width: number;
  height: number;
  className?: string;
};

/**
 * The site string, drawn with the same three layers and 3D volume filter
 * as `TitleThread`: flat shadow, black outline, pink body.
 */
export function PullThread({ d, width, height, className }: PullThreadProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const volumeId = `${rawId}-volume`;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id={volumeId}
          filterUnits="userSpaceOnUse"
          x="-200"
          y="-200"
          width="4000"
          height="4000"
        >
          <feOffset dx="4" dy="4" in="SourceAlpha" result="lightShift" />
          <feComposite
            in="SourceAlpha"
            in2="lightShift"
            operator="out"
            result="lightMask"
          />
          <feFlood floodColor="white" floodOpacity="0.3" result="lightColor" />
          <feComposite
            in="lightColor"
            in2="lightMask"
            operator="in"
            result="light"
          />
          <feOffset dx="-4" dy="-4" in="SourceAlpha" result="shadeShift" />
          <feComposite
            in="SourceAlpha"
            in2="shadeShift"
            operator="out"
            result="shadeMask"
          />
          <feFlood floodColor="black" floodOpacity="0.4" result="shadeColor" />
          <feComposite
            in="shadeColor"
            in2="shadeMask"
            operator="in"
            result="shade"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="light" />
            <feMergeNode in="shade" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d={d}
        fill="transparent"
        stroke="var(--thread-shadow, rgba(0,0,0,0.2))"
        strokeWidth="var(--thread-thickness)"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "blur(6px)" }}
        transform="translate(10, 10)"
      />
      <motion.path
        d={d}
        fill="transparent"
        stroke="var(--thread-outline, #171717)"
        strokeWidth="calc(var(--thread-thickness) + var(--thread-outline-width) * 2)"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <motion.path
        d={d}
        fill="transparent"
        stroke="var(--thread-color, #e5e5e5)"
        strokeWidth="var(--thread-thickness)"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${volumeId})`}
      />
    </svg>
  );
}
