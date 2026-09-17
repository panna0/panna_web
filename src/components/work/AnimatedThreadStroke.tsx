"use client"; // Necessario per framer-motion

import { motion, type SVGMotionProps } from "framer-motion";
import {
  offsetPolyline,
  polylineToPath,
  type Point,
} from "@/components/work/threadGeometry";
import type { ThreadMetrics } from "./threadGeometry";

// Estendiamo le props originali per accettare quelle di framer-motion per i path SVG
type AnimatedThreadStrokeProps = {
  points: Point[];
  thread: ThreadMetrics;
  /** Ombra piatta sotto il filo, come sulle card. */
  shadow?: boolean;
} & SVGMotionProps<SVGPathElement>;

/**
 * Versione animabile di ThreadStroke. 
 * Accetta props di framer-motion (es. initial, animate, transition) 
 * che vengono applicate in sincrono a tutti i layer del filo.
 */
export function AnimatedThreadStroke({
  points,
  thread,
  shadow = true,
  ...motionProps // Raccoglie tutte le props di animazione passate dal genitore
}: AnimatedThreadStrokeProps) {
  if (points.length < 2) return null;

  const center = polylineToPath(points);
  const highlight = polylineToPath(
    offsetPolyline(points, (thread.thickness - thread.highlight) / 2),
  );
  const shade = polylineToPath(
    offsetPolyline(points, -(thread.thickness - thread.shade) / 2),
  );
  const band = thread.thickness + thread.outline * 2;

  return (
    <g fill="none" strokeLinejoin="round" strokeLinecap="round">
      {shadow ? (
        <motion.path
          transform="translate(6 12)"
          strokeWidth={band}
          style={{ stroke: "var(--thread-shadow)" }}
          animate={{ d: center, ...(motionProps.animate as any) }}
          {...motionProps}
        />
      ) : null}
      <motion.path
        strokeWidth={band}
        style={{ stroke: "var(--thread-outline)" }}
        animate={{ d: center, ...(motionProps.animate as any) }}
        {...motionProps}
      />
      <motion.path
        strokeWidth={thread.thickness}
        style={{ stroke: "var(--thread-color)" }}
        animate={{ d: center, ...(motionProps.animate as any) }}
        {...motionProps}
      />
      <motion.path
        strokeWidth={thread.highlight}
        style={{ stroke: "var(--thread-highlight)" }}
        animate={{ d: highlight, ...(motionProps.animate as any) }}
        {...motionProps}
      />
      <motion.path
        strokeWidth={thread.shade}
        style={{ stroke: "var(--thread-shade)" }}
        animate={{ d: shade, ...(motionProps.animate as any) }}
        {...motionProps}
      />
    </g>
  );
}