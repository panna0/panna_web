"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useDragControls,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import { PullThread } from "./PullThread";
import styles from "../Intro.module.css";

const SEAM = 0.7;
const TURN = 44;
const OVERLAP = 72;
const HANDLE = 88;
/** Vertical slack at the free end, in px. */
const FLEX_Y = 40;
/** Path endpoint of the hanging string, below the navbar and hanging tabs. */
export const STRING_REST_TOP = 136;
const PANEL_SPRING = {
  type: "spring" as const,
  bounce: 0.2,
  duration: 0.8,
};
const DROP_SPRING = {
  type: "spring" as const,
  stiffness: 120,
  damping: 18,
  mass: 1.1,
};
const SNAP_BACK = {
  type: "spring" as const,
  stiffness: 420,
  damping: 32,
  mass: 1,
};

export function measureWorkThreadX() {
  if (typeof window === "undefined") return 200;
  const stage = document.querySelector("[data-work-stage]");
  if (stage instanceof HTMLElement) {
    const rect = stage.getBoundingClientRect();
    const padX = Math.min(250, Math.max(56, rect.width * 0.17));
    return rect.left + padX;
  }
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--work-thread-x")
    .trim();
  if (raw.endsWith("px")) {
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Math.max(56, window.innerWidth * 0.22);
}

function sealSizeFor(width: number) {
  return Math.round(Math.min(250, Math.max(128, width * 0.16)));
}

function sealLayout(vw: number, workX: number) {
  const sealSize = sealSizeFor(vw);
  const sealCenter = vw * 0.5;
  const sealLeft = sealCenter - sealSize / 2;
  const sealRight = sealCenter + sealSize / 2;
  const restEnd = vw - (vw < 640 ? 32 : 44);
  const room = Math.max(24, sealLeft - workX);
  const turnR = Math.min(TURN, Math.max(14, room * 0.4));
  return {
    sealSize,
    sealCenter,
    sealLeft,
    sealRight,
    turnR,
    restEnd,
  };
}

// RESTING STATE FINALE: Da sinistra orizzontale, curva su verso top
function hangingPath(x: number, top: number, seamY: number) {
  const turnR = 16;
  const p0x = -100, p0y = seamY;
  const p1x = x - turnR, p1y = seamY;
  const p2x = x, p2y = seamY;
  const p3x = x, p3y = seamY;
  const p4x = x, p4y = seamY - turnR;
  const p5x = x, p5y = top + 1;
  const p6x = x, p6y = top;
  const p7x = x, p7y = top;
  const p8x = x, p8y = top;
  
  return `M ${p0x} ${p0y} L ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y} L ${p5x} ${p5y} C ${p6x} ${p6y} ${p7x} ${p7y} ${p8x} ${p8y}`;
}

// DRAGGING STATE: Totalmente orizzontale da sinistra fino all'ancora, poi fa il loop di trascinamento
function flexPath(
  stemX: number,
  restEnd: number,
  seamY: number,
  anchorX: number,
  offsetX: number,
  offsetY: number
) {
  const turnR = 16;
  
  // Segmento base orizzontale
  const p0x = -100, p0y = seamY;
  const p1x = stemX - turnR, p1y = seamY;
  // Per mantenere l'integrità strutturale con hangingPath, usiamo una curva C piatta
  const p2x = stemX, p2y = seamY;
  const p3x = stemX, p3y = seamY;
  const p4x = stemX + turnR, p4y = seamY;
  const p5x = anchorX, p5y = seamY;
  
  // Segmento dinamico in trazione
  const tipX = Math.max(anchorX, restEnd + Math.min(0, offsetX));
  const tipY = seamY + offsetY;
  const span = Math.max(0, tipX - anchorX);
  const p6x = anchorX + span * 0.28, p6y = seamY + offsetY * 0.08;
  const p7x = anchorX + span * 0.68, p7y = seamY + offsetY * 1.22;
  const p8x = tipX, p8y = tipY;
  
  return `M ${p0x} ${p0y} L ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y} L ${p5x} ${p5y} C ${p6x} ${p6y} ${p7x} ${p7y} ${p8x} ${p8y}`;
}

function sliceProgress(
  dragX: number,
  restEnd: number,
  sealRight: number,
  sealCenter: number,
) {
  const tip = restEnd + Math.min(0, dragX);
  if (tip >= sealRight) return 0;
  const span = Math.max(1, sealRight - sealCenter);
  return Math.min(1, Math.max(0, (sealRight - tip) / span));
}

function topSliceClip(progress: number) {
  const p = (1 - progress) * 100;
  const gap = progress > 0 ? 8 : 0;
  return `polygon(0% 0%, 100% 0%, 100% calc(50% - ${gap}px), ${p}% calc(50% - ${gap}px), ${p}% 100%, 0% 100%)`;
}

function bottomSliceClip(progress: number) {
  const p = (1 - progress) * 100;
  const gap = progress > 0 ? 8 : 0;
  return `polygon(${p}% calc(50% + ${gap}px), 100% calc(50% + ${gap}px), 100% 100%, ${p}% 100%)`;
}

type FolderOverlayProps = {
  viewport: { width: number; height: number };
  onOpened: () => void;
};

export function FolderOverlay({ viewport, onOpened }: FolderOverlayProps) {
  "use no memo";

  const overlayRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(viewport);
  const sizeRef = useRef(viewport);
  const dragControls = useDragControls();
  const completing = useRef(false);
  const opened = useRef(false);
  const [torn, setTorn] = useState(false);
  const [workX, setWorkX] = useState(() => viewport.width * 0.22);

  const vw = size.width;
  const vh = size.height;
  sizeRef.current = size;

  const seamY = vh * SEAM;
  const layout = sealLayout(vw, workX);
  const { sealSize, sealCenter, sealRight, restEnd } = layout;
  const threshold = restEnd - sealCenter;
  const maxDrag = Math.max(96, threshold + 16);

  const geometryRef = useRef({
    restEnd,
    sealCenter,
    sealRight,
    seamY,
    workX,
  });
  geometryRef.current = {
    restEnd,
    sealCenter,
    sealRight,
    seamY,
    workX,
  };

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const pathD = useMotionValue(
    flexPath(workX, restEnd, seamY, sealCenter, 0, 0),
  );
  const knotOpacity = useMotionValue(1);

  const tipX = useTransform(dragX, (x) => {
    const { restEnd: start, sealCenter: anchor } = geometryRef.current;
    return Math.max(anchor, start + Math.min(0, x));
  });
  const tipY = useTransform(dragY, (y) => geometryRef.current.seamY + y);
  const c1x = useTransform(dragX, (x) => {
    const { restEnd: start, sealCenter: anchor } = geometryRef.current;
    const span = Math.max(0, start + Math.min(0, x) - anchor);
    return anchor + span * 0.28;
  });
  const c1y = useTransform(dragY, (y) => geometryRef.current.seamY + y * 0.08);
  const c2x = useTransform(dragX, (x) => {
    const { restEnd: start, sealCenter: anchor } = geometryRef.current;
    const span = Math.max(0, start + Math.min(0, x) - anchor);
    return anchor + span * 0.68;
  });
  const c2y = useTransform(dragY, (y) => geometryRef.current.seamY + y * 1.22);

  const turnR = 16;
  
  // Il template segue alla virgola i punti generati da flexPath
  const flexPathD = useMotionTemplate`M -100 ${seamY} L ${workX - turnR} ${seamY} C ${workX} ${seamY} ${workX} ${seamY} ${workX + turnR} ${seamY} L ${sealCenter} ${seamY} C ${c1x} ${c1y} ${c2x} ${c2y} ${tipX} ${tipY}`;

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      const next = { width: rect.width, height: rect.height };
      sizeRef.current = next;
      setSize(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    setWorkX(measureWorkThreadX());
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (completing.current) return;
    pathD.set(
      flexPath(
        workX,
        restEnd,
        seamY,
        sealCenter,
        dragX.get(),
        dragY.get()
      ),
    );
  }, [dragX, dragY, pathD, restEnd, sealCenter, seamY, workX]);

  const topClip = useTransform(dragX, (x) => {
    const { restEnd: start, sealRight: right, sealCenter: anchor } =
      geometryRef.current;
    return topSliceClip(sliceProgress(x, start, right, anchor));
  });
  const bottomClip = useTransform(dragX, (x) => {
    const { restEnd: start, sealRight: right, sealCenter: anchor } =
      geometryRef.current;
    return bottomSliceClip(sliceProgress(x, start, right, anchor));
  });
  const handleLeft = restEnd - HANDLE / 2;

  const finish = () => {
    if (completing.current) return;
    completing.current = true;
    setTorn(true);
    dragX.set(-threshold);
    animate(dragY, 0, { duration: 0.2, ease: "easeOut" });
    animate(knotOpacity, 0, { duration: 0.22, ease: "easeOut" });
    const rest = measureWorkThreadX();
    animate(
      pathD,
      hangingPath(rest, STRING_REST_TOP, seamY),
      DROP_SPRING,
    );
    window.setTimeout(() => {
      if (opened.current) return;
      opened.current = true;
      onOpened();
    }, 850);
  };

  useMotionValueEvent(flexPathD, "change", (next) => {
    if (completing.current) return;
    pathD.set(next);
  });

  useMotionValueEvent(dragX, "change", (x) => {
    if (completing.current) return;
    if (x <= -threshold) finish();
  });

  const onDragEnd = () => {
    if (completing.current) return;
    if (dragX.get() <= -threshold) {
      finish();
      return;
    }
    animate(dragX, 0, SNAP_BACK);
    animate(dragY, 0, SNAP_BACK);
  };

  const notifyOpened = () => {
    if (!torn || opened.current) return;
    opened.current = true;
    onOpened();
  };

  return (
    <motion.div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Archival folder. Pull the string left to break the seal."
    >
      <motion.div
        className={`${styles.panel} ${styles.topPanel}`}
        initial={{ y: 0 }}
        animate={torn ? { y: "-100vh" } : { y: 0 }}
        transition={PANEL_SPRING}
        onAnimationComplete={notifyOpened}
      >
        <div className={styles.folderLabel}>
          <div className={styles.folderLabelInner}>
            <div className={`${styles.tabRow} ${styles.top}`}>
              <h3 className={styles.folderTitle}>Creative Portfolio</h3>
            </div>
            <div className={`${styles.tabRow} ${styles.middle}`}>
              <h4 className={styles.sealTitle}>Panna</h4>
            </div>
            <div className={`${styles.tabRow} ${styles.bottom}`}>
              <div className={styles.tabRowInner}>
                <h3 className={styles.fileNumber}>File Num: <span>1002038</span></h3>
              </div>
              <div className={`${styles.tabRowInner} ${styles.right}`}>
                <h3 className={styles.fileNumber}>Date: <span>10/07/2026</span></h3>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={`${styles.panel} ${styles.bottomPanel}`}
        initial={{ y: 0 }}
        animate={torn ? { y: "100vh" } : { y: 0 }}
        transition={PANEL_SPRING}
      />

      {torn ? null : (
        <p className={styles.hintPostit}>
          Pull the string and tear the seal to begin
        </p>
      )}

      <div className={styles.stringLayer} aria-hidden="true">
        <PullThread
          className={styles.stringSvg}
          d={pathD}
          width={vw}
          height={vh + OVERLAP}
        />
      </div>

      <div
        className={styles.sealAnchor}
        style={{
          width: sealSize,
          height: sealSize,
          top: seamY - sealSize / 2,
        }}
        aria-hidden="true"
      >
        <motion.div
          className={styles.seal}
          style={{ clipPath: topClip }}
          initial={{ y: 0 }}
          animate={torn ? { y: "-100vh" } : { y: 0 }}
          transition={PANEL_SPRING}
        >
          <SealFace />
        </motion.div>
        <motion.div
          className={styles.seal}
          style={{ clipPath: bottomClip }}
          initial={{ y: 0 }}
          animate={torn ? { y: "100vh" } : { y: 0 }}
          transition={PANEL_SPRING}
        >
          <SealFace />
        </motion.div>
      </div>

      <motion.div
        className={styles.handle}
        role="slider"
        aria-label="Pull the string left to cut the seal"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        style={{
          x: dragX,
          y: dragY,
          left: handleLeft,
          top: seamY - HANDLE / 2,
          opacity: knotOpacity,
        }}
        drag={!torn}
        dragControls={dragControls}
        dragListener
        dragConstraints={{
          left: -maxDrag,
          right: 0,
          top: -FLEX_Y,
          bottom: FLEX_Y,
        }}
        dragElastic={{ left: 0.04, right: 0.02, top: 0.18, bottom: 0.18 }}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " " ||
            event.key === "ArrowLeft"
          ) {
            event.preventDefault();
            finish();
          }
        }}
      >
      </motion.div>

      {torn ? null : (
        <div
          className={styles.dragCatcher}
          style={{ left: sealCenter }}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            dragControls.start(event);
          }}
        />
      )}
    </motion.div>
  );
}

function SealFace() {
  return (
    <div className={styles.sealFace}>
      <span className={styles.sealRing} />
    </div>
  );
}