"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { Service, ServiceIconId } from "@/lib/services";
import styles from "./ServiceCard.module.css";

type ServiceCardProps = {
  service: Service;
  /** Angolo di dondolio in gradi, condiviso da tutte le card dello slider. */
  rotate: MotionValue<number>;
  /** True mentre l'utente tiene premuto per trascinare lo slider. */
  dragging: boolean;
};

/** 0–180: quanto la card è ruotata, indipendente dal segno. */
function foldAngle(deg: number) {
  let angle = Math.abs(deg) % 360;
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/** Stili 3D con prefisso webkit: Safari altrimenti mostra entrambe le facce. */
const hideBackface: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
};

const ICONS: Record<ServiceIconId, ReactNode> = {
  identity: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.25" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2.25" fill="currentColor" />
    </svg>
  ),
  direction: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19V5h14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M5 15.5 19 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  digital: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="4.25"
        y="5.25"
        width="15.5"
        height="11.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M8 19.5h8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  content: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 5.5h10v13H7z" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 9.5h4M10 12.5h4M10 15.5h2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  strategy: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 16.5 9.5 12l3 3L19 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  consulting: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 16.5 5 19V8.5A1.5 1.5 0 0 1 6.5 7h7A1.5 1.5 0 0 1 15 8.5V15a1.5 1.5 0 0 1-1.5 1.5H7.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M15 10h2.5A1.5 1.5 0 0 1 19 11.5V19l-2.2-2.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export function ServiceCard({ service, rotate, dragging }: ServiceCardProps) {
  const reduceMotion = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const [wasDragging, setWasDragging] = useState(dragging);
  const touchStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const flipDuration = reduceMotion ? 0 : 1;
  const flipRotate = useMotionValue(0);

  if (dragging !== wasDragging) {
    setWasDragging(dragging);
    if (!dragging) setFlipped(false);
  }

  const showBack = flipped;

  /*
    I pezzi di filo davanti si accendono/spengono a 90°, quando la card è
    di taglio: niente sfumature, uno scatto nell'unico frame in cui non
    si vede l'intreccio.
  */
  const afterVisibility = useTransform(flipRotate, (deg) =>
    foldAngle(deg) < 90 ? "visible" : "hidden",
  );
  const beforeVisibility = useTransform(flipRotate, (deg) =>
    foldAngle(deg) < 90 ? "hidden" : "visible",
  );

  useEffect(() => {
    const playback = animate(flipRotate, showBack ? 180 : 0, {
      type: "tween",
      duration: flipDuration,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => playback.stop();
  }, [showBack, flipDuration, flipRotate]);

  return (
    <article
      className={styles.card}
      onPointerEnter={(event) => {
        if (dragging || event.pointerType !== "mouse") return;
        setFlipped(true);
      }}
      onPointerLeave={(event) => {
        if (dragging || event.pointerType !== "mouse") return;
        setFlipped(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        touchStart.current = {
          x: event.clientX,
          y: event.clientY,
          id: event.pointerId,
        };
      }}
      onPointerUp={(event) => {
        if (dragging) {
          touchStart.current = null;
          return;
        }
        const start = touchStart.current;
        if (!start || start.id !== event.pointerId) return;
        touchStart.current = null;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (dx * dx + dy * dy < 100) setFlipped((value) => !value);
      }}
      onPointerCancel={() => {
        touchStart.current = null;
      }}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        setFlipped((value) => !value);
      }}
      role="button"
      tabIndex={0}
      aria-pressed={showBack}
      aria-label={`${service.title}: gira la card per i dettagli`}
    >
      {/*
        Pendolo: solo rotateZ. L'hover vive sull'article, che non gira in Y,
        così a metà flip il puntatore non "esce" dalla hitbox e non riavvolge
        l'animazione.
      */}
      <motion.div className={styles.swinger} style={{ rotate }}>

        <motion.div
          className={styles.flipper}
          style={{ rotateY: flipRotate, transformStyle: "preserve-3d" }}
        >
          <div
            className={styles.front}
            style={{
              ...hideBackface,
              transform: "rotateY(0deg) translateZ(1px)",
            }}
          >
          <span className={styles.ring} style={{ backgroundColor: "#626262" }}>
            <span className={styles.ringInner} style={{ backgroundColor: "#000000" }}></span>
          </span>
            <div className={styles.frontInner} style={{ background: `radial-gradient(
                circle at 50% var(--hole-y-content, 28px),
                transparent var(--hole-r, 11px),
                ${service.color1} calc(var(--hole-r, 11px) + 2px)
              )` }}>
              
            </div>
            <div className={styles.textContent}>
                <h1>{service.id}</h1>
                <h3>{service.title}</h3>
                <p>Hover to reveal mix</p>
              </div>
          </div>

          <div
            className={styles.back}
            style={{
              ...hideBackface,
              transform: "rotateY(180deg) translateZ(1px)",
            }}
          >
            <span className={styles.ring} style={{ backgroundColor: "#626262" }}>
              <span className={styles.ringInner} style={{ backgroundColor: service.color1 }}></span>
            </span>

            <div className={styles.cardContent}>
              <p className={styles.mixLabel}>Formula</p>
              <ul className={styles.mix}>
                {service.skills.map((skill) => (
                  <li key={skill.name} className={styles.mixRow}>
                    <span className={styles.mixName}>{skill.name}</span>
                    <span className={styles.mixRule} aria-hidden="true" />
                    <span className={styles.mixPts}>{skill.level} PT</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/*
        Filo davanti al tondino: sulla card, non sul pendolo, così resta
        tesato sul rail. Estetica originale (dal centro del buco fino alla
        card successiva). Visibilità a scatto a 90° di rotateY.
      */}
      <motion.span
        className={`${styles.threadOver} ${styles.threadOverAfter}`}
        aria-hidden="true"
        style={{ visibility: afterVisibility }}
      />
      <motion.span
        className={`${styles.threadOver} ${styles.threadOverBefore}`}
        aria-hidden="true"
        style={{ visibility: beforeVisibility }}
      />
    </article>
  );
}
