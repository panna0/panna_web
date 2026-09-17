"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { ServiceCard } from "@/components/services/ServiceCard";
import { RailLeadIn } from "@/components/services/RailLeadIn";
import { SERVICES } from "@/lib/services";
import styles from "./ServicesSlider.module.css";

/** Velocità di trascinamento (px/s) oltre la quale il dondolio è al massimo. */
const FULL_SWING_VELOCITY = 2200;
const MAX_SWING_DEG = 15;
/** Fuori schermo a destra, identico su server e client per evitare hydration mismatch. */
const ENTRANCE_OFFSET = 4000;

export function ServicesSlider() {
  const stageRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const entering = !reduceMotion && !hasEntered;

  // 1. Posizione visiva delle card: x = ingresso − scrollLeft.
  //    Durante l'entrata `ingresso` parte da destra e scende a 0;
  //    dopo, resta 0 e x è di nuovo solo −scrollLeft.
  const x = useMotionValue(0);
  const entranceX = useMotionValue(ENTRANCE_OFFSET);

  // 2. dx/dt in px/s, cioè la forza del gesto. Vale per ogni sorgente di
  //    movimento: mouse, dito, trackpad, coda d'inerzia e l'entrata iniziale.
  const velocity = useVelocity(x);

  // 3. Forza → angolo con una mappa lineare clampata, quindi |θ| è
  //    direttamente proporzionale a |v| fino al tetto:
  //      |v| ≥ FULL_SWING_VELOCITY  ⇒  |θ| = MAX_SWING_DEG
  //    Segno: card verso sinistra ⇒ v < 0. Il corpo resta indietro e il
  //    fondo finisce a destra del perno, che in CSS è un angolo negativo:
  //    da qui la pendenza positiva della mappa.
  const swing = useTransform(
    velocity,
    [-FULL_SWING_VELOCITY, FULL_SWING_VELOCITY],
    reduceMotion ? [0, 0] : [-MAX_SWING_DEG, MAX_SWING_DEG],
  );

  // 4. Il perno è una molla sotto-smorzata (ζ ≈ 0.5): finito il gesto
  //    v → 0 e la card non si raddrizza di scatto, ma oscilla attorno
  //    allo zero spegnendosi come un pendolo.
  const rotate = useSpring(swing, {
    stiffness: 70,
    damping: 9,
    mass: 1.1,
  });

  useEffect(() => {
    const syncX = () => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      x.set(entranceX.get() - scroller.scrollLeft);
    };

    const unsub = entranceX.on("change", syncX);
    syncX();
    return unsub;
  }, [entranceX, x]);

  useEffect(() => {
    const stage = stageRef.current;
    const scroller = scrollerRef.current;
    if (!stage || !scroller) return;

    if (reduceMotion) {
      entranceX.set(0);
      return;
    }

    // Allinea il binario al bordo destro ora, mentre la section è ancora
    // fuori vista: così l'ingresso visibile parte già dal filo, senza uno
    // scatto 4000→viewport che farebbe dondolare le card per la velocità.
    entranceX.set(scroller.clientWidth);

    let playback: ReturnType<typeof animate> | null = null;
    let started = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        setDragging(true);
        playback = animate(entranceX, 0, {
          type: "tween",
          duration: 1.85,
          ease: [0.33, 0.05, 0.2, 1],
        });
        playback.then(() => {
          setHasEntered(true);
          setDragging(false);
        });
      },
      { threshold: 0.22 },
    );

    observer.observe(stage);
    return () => {
      observer.disconnect();
      playback?.stop();
    };
  }, [entranceX, reduceMotion]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let activePointer: number | null = null;
    let originClientX = 0;
    let originScrollLeft = 0;
    let lastClientX = 0;
    let lastTimeStamp = 0;
    let glideVelocity = 0;
    let glideFrame = 0;
    let pointersDown = 0;
    let scrollIdle = 0;
    let locked = false;

    const stopGlide = () => {
      if (glideFrame) cancelAnimationFrame(glideFrame);
      glideFrame = 0;
    };

    const setLocked = (next: boolean) => {
      if (locked === next) return;
      locked = next;
      setDragging(next);
    };

    const scheduleUnlock = () => {
      window.clearTimeout(scrollIdle);
      scrollIdle = window.setTimeout(() => {
        scrollIdle = 0;
        if (pointersDown === 0 && !glideFrame) setLocked(false);
      }, 180);
    };

    const onScroll = () => {
      x.set(entranceX.get() - scroller.scrollLeft);
      setLocked(true);
      scheduleUnlock();
    };

    const onPointerDown = (event: PointerEvent) => {
      pointersDown += 1;
      if (event.pointerType === "touch" || event.button !== 0) return;
      stopGlide();
      setLocked(true);
      activePointer = event.pointerId;
      originClientX = event.clientX;
      lastClientX = event.clientX;
      originScrollLeft = scroller.scrollLeft;
      lastTimeStamp = event.timeStamp;
      glideVelocity = 0;
      scroller.classList.add(styles.dragging);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (activePointer !== event.pointerId) return;
      const elapsed = event.timeStamp - lastTimeStamp;
      if (elapsed > 0) {
        glideVelocity = (event.clientX - lastClientX) / elapsed;
        lastClientX = event.clientX;
        lastTimeStamp = event.timeStamp;
      }
      scroller.scrollLeft = originScrollLeft - (event.clientX - originClientX);
    };

    const onPointerUp = (event: PointerEvent) => {
      pointersDown = Math.max(0, pointersDown - 1);
      if (activePointer === event.pointerId) {
        activePointer = null;
        scroller.classList.remove(styles.dragging);
        if (!reduceMotion && Math.abs(glideVelocity) >= 0.05) {
          let previous = performance.now();
          const glide = (now: number) => {
            const elapsed = Math.min(now - previous, 32);
            previous = now;
            scroller.scrollLeft -= glideVelocity * elapsed;
            glideVelocity *= 0.92 ** (elapsed / 16);
            glideFrame =
              Math.abs(glideVelocity) > 0.02 ? requestAnimationFrame(glide) : 0;
            if (!glideFrame) scheduleUnlock();
          };
          glideFrame = requestAnimationFrame(glide);
          return;
        }
      }
      scheduleUnlock();
    };

    x.set(entranceX.get() - scroller.scrollLeft);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", onScroll, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      stopGlide();
      window.clearTimeout(scrollIdle);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onScroll);
      scroller.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [entranceX, reduceMotion, x]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div className={styles.rail} aria-hidden="true" />
      <div
        ref={scrollerRef}
        className={`${styles.scroller} ${entering ? styles.entering : ""}`}
        tabIndex={0}
        role="group"
        aria-label="Servizi: trascina per scorrere"
      >
        <motion.div className={styles.track} style={{ x: entranceX }}>
          {SERVICES.map((service) => (
            <div key={service.id} className={styles.item}>
              <ServiceCard
                service={service}
                rotate={rotate}
                dragging={dragging}
              />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
