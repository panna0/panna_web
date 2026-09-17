"use client";

import { useEffect, useRef, useState } from "react";
import { ThreadStroke } from "@/components/work/ThreadStroke";
import {
  buildRailLeadIn,
  readCssPx,
  type ThreadMetrics,
} from "@/components/work/threadGeometry";
import styles from "./ServicesSlider.module.css";

type Lead = {
  thread: ThreadMetrics;
  railY: number;
  height: number;
  leftRoom: number;
};

/**
 * Il filo rientra da sinistra e si posa sul rail. È lo stesso capo che in
 * Work è uscito verso il basso e ha virato a sinistra, fuori dallo schermo.
 */
export function RailLeadIn() {
  const ref = useRef<SVGSVGElement>(null);
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    const stage = ref.current?.parentElement;
    if (!stage) return;

    const measure = () => {
      const css = getComputedStyle(stage);
      const rect = stage.getBoundingClientRect();
      setLead({
        thread: {
          thickness: readCssPx(css, "--thread-thickness", 30),
          highlight: readCssPx(css, "--thread-highlight-width", 5),
          shade: readCssPx(css, "--thread-shade-width", 4),
          outline: readCssPx(css, "--thread-outline-width", 2),
        },
        railY:
          readCssPx(css, "--swing-headroom", 80) +
          readCssPx(css, "--hole-y", 76.8),
        height: rect.height,
        leftRoom: rect.left + 160,
      });
    };

    const first = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => {
      cancelAnimationFrame(first);
      observer.disconnect();
    };
  }, []);

  const width = lead ? lead.leftRoom + 120 : 280;

  return (
    <svg
      ref={ref}
      className={styles.leadIn}
      viewBox={
        lead ? `${-lead.leftRoom} 0 ${width} ${lead.height}` : undefined
      }
      width={width}
      height={lead?.height}
      aria-hidden="true"
      style={lead ? { left: -lead.leftRoom } : undefined}
    >
      {lead ? (
        <ThreadStroke
          points={buildRailLeadIn(lead.railY, lead.leftRoom)}
          thread={lead.thread}
        />
      ) : null}
    </svg>
  );
}
