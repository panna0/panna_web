"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";
import { FolderOverlay, measureWorkThreadX, STRING_REST_TOP } from "./intro/FolderOverlay";
import { PullThread } from "./intro/PullThread";
import styles from "./Intro.module.css";

const THREAD_OVERLAP = 72;

function HeroSheet() {
  return (
    <div className={styles.hero}>
      <div className={styles.sheet}>
        <div className={styles.sheetInner}>
          
        </div>
      </div>
    </div>
  );
}

function BridgeThread({
  width,
  height,
  x,
}: {
  width: number;
  height: number;
  x: number;
}) {
  const SEAM = 0.7;
  const seamY = height * SEAM;
  const top = STRING_REST_TOP;
  const turnR = 16;
  
  // Da sinistra (-100) orizzontale fino a 'x', curva verso l'alto, e sale dritto.
  const p0x = -100, p0y = seamY;
  const p1x = x - turnR, p1y = seamY;
  const p2x = x, p2y = seamY;
  const p3x = x, p3y = seamY;
  const p4x = x, p4y = seamY - turnR;
  const p5x = x, p5y = top + 1;
  const p6x = x, p6y = top;
  const p7x = x, p7y = top;
  const p8x = x, p8y = top;

  const d = `M ${p0x} ${p0y} L ${p1x} ${p1y} C ${p2x} ${p2y} ${p3x} ${p3y} ${p4x} ${p4y} L ${p5x} ${p5y} C ${p6x} ${p6y} ${p7x} ${p7y} ${p8x} ${p8y}`;

  return (
    <div className={styles.bridge} aria-hidden="true">
      <PullThread
        className={styles.bridgeSvg}
        d={d}
        width={width}
        height={height + THREAD_OVERLAP}
      />
    </div>
  );
}

export function Intro() {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [sealed, setSealed] = useState(true);
  const [scrollLocked, setScrollLocked] = useState(true);
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });
  const [sectionSize, setSectionSize] = useState({ width: 1200, height: 800 });
  const [bridgeX, setBridgeX] = useState(264);

  useEffect(() => {
    const section = document.getElementById(SECTION_IDS.intro);
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      setBridgeX(measureWorkThreadX());
      if (section) {
        setSectionSize({
          width: section.clientWidth,
          height: section.clientHeight,
        });
      }
    };
    update();
    setReady(true);
    window.addEventListener("resize", update);
    const observer = section ? new ResizeObserver(update) : null;
    if (section && observer) observer.observe(section);
    return () => {
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setSealed(false);
      setScrollLocked(false);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (!scrollLocked) return;
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
      bodyOverscroll: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    body.setAttribute("data-intro-sealed", "true");
    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      html.style.overscrollBehavior = previous.htmlOverscroll;
      body.style.overscrollBehavior = previous.bodyOverscroll;
      body.removeAttribute("data-intro-sealed");
    };
  }, [scrollLocked]);

  return (
    <Section
      id={SECTION_IDS.intro}
      className={`${styles.section} ${sealed ? styles.sectionSealed : ""}`}
    >
      <HeroSheet />
      {sealed ? null : (
        <BridgeThread
          width={sectionSize.width}
          height={sectionSize.height}
          x={bridgeX}
        />
      )}
      <AnimatePresence
        onExitComplete={() => {
          setBridgeX(measureWorkThreadX());
          setScrollLocked(false);
        }}
      >
        {sealed ? (
          ready ? (
            <FolderOverlay
              key="folder-overlay"
              viewport={viewport}
              onOpened={() => setSealed(false)}
            />
          ) : (
            <div className={styles.overlay} aria-hidden="true">
              <div className={`${styles.panel} ${styles.topPanel}`} />
              <div className={`${styles.panel} ${styles.bottomPanel}`} />
            </div>
          )
        ) : null}
      </AnimatePresence>
    </Section>
  );
}