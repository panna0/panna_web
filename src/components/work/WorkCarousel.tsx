"use client";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { PROJECTS } from "@/lib/projects";
import { ThreadFrame, type ThreadMetrics } from "./ThreadFrame";
import {
  EDGE,
  buildQuad,
  buildTails,
  clamp,
  edgeParam,
  readCssPx,
  resist,
  type EdgeIndex,
  type Grab,
  type Quad,
  type Size,
  type Tails,
} from "./threadGeometry";
import styles from "./WorkCarousel.module.css";

/** Ritorno elastico dopo lo scatto: sotto-smorzato, quindi rimbalza. */
const SNAP_BACK = {
  type: "spring" as const,
  stiffness: 520,
  damping: 12,
  mass: 0.85,
};

/** Rilascio sotto soglia: il filo si riassesta senza scatto né rimbalzo. */
const RELAX = {
  type: "spring" as const,
  stiffness: 280,
  damping: 26,
  mass: 1,
};

const QUICK = { duration: 0.16, ease: "easeOut" as const };

type Frame = {
  size: Size;
  quad: Quad;
  thread: ThreadMetrics;
  tails: Tails;
  /** Pancia massima visibile: sta dentro il margine libero dello stage. */
  maxStretchX: number;
  maxStretchY: number;
  /** Trascinamento reale (px) a cui il filo sfugge dalla presa. */
  escape: number;
  /** Trascinamento oltre il quale, al rilascio, lo scatto cambia progetto. */
  release: number;
};

type Gesture = {
  pointerId: number;
  edge: EdgeIndex;
  originX: number;
  originY: number;
  /** Trascinamento verso l'esterno, con segno: negativo se si spinge dentro. */
  outward: number;
  /** Distanza massima percorsa: distingue un trascinamento da un click. */
  travel: number;
};

function measureFrame(stage: HTMLDivElement): Frame {
  const rect = stage.getBoundingClientRect();
  const { width, height } = rect;
  const css = getComputedStyle(stage);
  const thread: ThreadMetrics = {
    thickness: readCssPx(css, "--thread-thickness", 30),
    highlight: readCssPx(css, "--thread-highlight-width", 5),
    shade: readCssPx(css, "--thread-shade-width", 4),
    outline: readCssPx(css, "--thread-outline-width", 2),
  };

  /*
    Il margine libero attorno alla cornice è lo spazio in cui il filo può
    gonfiarsi. L'immagine copre tutto lo stage, margine incluso: tirando, la
    finestra si allarga e scopre più immagine invece di lasciare un vuoto.
  */
  const padX = clamp(width * 0.17, 56, 250);
  const padY = clamp(height * 0.12, 44, 120);
  const quad = buildQuad({ width, height }, padX, padY);
  const escape = clamp((quad[1].x - quad[0].x) * 0.4, 150, 380);

  /*
    Le code sbordano dallo stage. Sopra il filo arriva dal bordo della
    sezione Work (con un accenno nell'intro); a sinistra supera il bordo
    della finestra, dove il rail dei servizi lo riprende. La sezione
    successiva ritaglia il proprio overflow, quindi la curva deve chiudersi
    prima del confine inferiore di Work.
  */
  const section = stage.closest("section")?.getBoundingClientRect();
  const tails = buildTails(
    quad,
    { width, height },
    {
      up: (section ? Math.max(rect.top - section.top, 0) : 80) + 72,
      down: Math.max(section ? section.bottom - rect.bottom : 0, 200),
      left: rect.left + 160,
    },
  );

  return {
    size: { width, height },
    quad,
    thread,
    tails,
    maxStretchX: padX * 0.86,
    maxStretchY: padY * 0.5,
    escape,
    release: escape * 0.42,
  };
}

/*
  La cattura del puntatore tiene il gesto sulla zona di presa anche quando il
  dito ne esce, ma va incapsulata: se il puntatore non è più attivo il browser
  solleva un'eccezione e il gesto non deve morire per questo.
*/
function capturePointer(target: HTMLElement, pointerId: number) {
  try {
    target.setPointerCapture(pointerId);
  } catch {
    /* Puntatore già chiuso: si continua a seguirlo con gli eventi normali. */
  }
}

function releasePointer(target: HTMLElement, pointerId: number) {
  try {
    if (target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId);
    }
  } catch {
    /* Già rilasciato. */
  }
}

/** Zone di presa sopra i due lati verticali del filo. */
function handleBox(frame: Frame, edge: EdgeIndex): CSSProperties {
  const { quad, thread } = frame;
  /* Presa comoda al dito, ma senza mai inghiottire la finestra dell'immagine. */
  const width = Math.min(thread.thickness + 44, (quad[1].x - quad[0].x) * 0.3);
  const top = Math.min(quad[0].y, quad[1].y) + thread.thickness;
  const bottom = Math.max(quad[2].y, quad[3].y) - thread.thickness;
  const centerX =
    edge === EDGE.right
      ? (quad[1].x + quad[2].x) / 2
      : (quad[0].x + quad[3].x) / 2;
  return { left: centerX - width / 2, top, width, height: bottom - top };
}

/** Rettangolo visibile della cornice (interno alle puntine), in px sullo stage. */
function quadBounds(quad: Quad) {
  const left = Math.min(quad[0].x, quad[1].x, quad[2].x, quad[3].x);
  const right = Math.max(quad[0].x, quad[1].x, quad[2].x, quad[3].x);
  const top = Math.min(quad[0].y, quad[1].y, quad[2].y, quad[3].y);
  const bottom = Math.max(quad[0].y, quad[1].y, quad[2].y, quad[3].y);
  return { left, top, width: right - left, height: bottom - top };
}

type CoverClipVars = CSSProperties & {
  "--clip-left": string;
  "--clip-top": string;
  "--clip-width": string;
  "--clip-height": string;
  "--bleed-x": string;
  "--bleed-y": string;
};

export function WorkCarousel() {
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [frame, setFrame] = useState<Frame | null>(null);
  const [index, setIndex] = useState(0);
  const clipId = `work-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const router = useRouter();
  const pullX = useMotionValue(0);
  const pullY = useMotionValue(0);
  const tension = useMotionValue(0);
  const grab = useRef<Grab | null>(null);
  const gesture = useRef<Gesture | null>(null);
  const settle = useRef<ReturnType<typeof animate>[]>([]);
  const lastTravel = useRef(0);

  /* L'immagine è tenuta dal filo: quando il filo cede, se la porta dietro. */
  const coverX = useTransform(pullX, (value) =>
    reduceMotion ? 0 : value * 0.22,
  );
  /*
    Scala sincronizzata allo stretch reale: la maschera si allarga di |pull|
    su un lato, e con origin al centro serve 2*|pull|/larghezza per coprire
    entrambi i lati senza lasciare il bordo tagliato.
  */
  const clipSizeRef = useRef({ width: 1, height: 1 });
  const reduceMotionRef = useRef(reduceMotion);
  reduceMotionRef.current = reduceMotion;
  if (frame) {
    clipSizeRef.current = quadBounds(frame.quad);
  }
  const coverScale = useTransform([pullX, pullY], ([x, y]) => {
    if (reduceMotionRef.current) return 1;
    const { width, height } = clipSizeRef.current;
    const sx = 1 + (2 * Math.abs(x)) / width;
    const sy = 1 + (2 * Math.abs(y)) / height;
    return Math.max(sx, sy);
  });

  /*
    Il filo esiste solo in px misurati, quindi la prima misura non può
    dipendere dalla notifica iniziale dell'osservatore: quella a volte non
    arriva e la cornice resterebbe invisibile. Misuro al frame successivo al
    mount, poi lascio all'osservatore i cambi di dimensione.
  */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const next = measureFrame(stage);
      setFrame(next);
      const rect = stage.getBoundingClientRect();
      document.documentElement.style.setProperty(
        "--work-thread-x",
        `${rect.left + next.quad[0].x}px`,
      );
    };
    const first = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => {
      cancelAnimationFrame(first);
      observer.disconnect();
    };
  }, []);

  const stopSettle = () => {
    settle.current.forEach((playback) => playback.stop());
    settle.current = [];
  };

  const home = (transition: typeof SNAP_BACK | typeof RELAX | typeof QUICK) => {
    stopSettle();
    settle.current = [
      animate(pullX, 0, transition),
      animate(pullY, 0, transition),
      animate(tension, 0, QUICK),
    ];
    Promise.all(settle.current.map((playback) => playback.finished)).then(
      () => {
        grab.current = null;
      },
      () => {},
    );
  };

  /** Lo scatto: il progetto cambia nell'istante in cui il filo parte indietro. */
  const advance = (direction: 1 | -1) => {
    setIndex(
      (current) => (current + direction + PROJECTS.length) % PROJECTS.length,
    );
    home(reduceMotion ? QUICK : SNAP_BACK);
  };

  /** Tirata breve comandata da tastiera o click, con lo stesso scatto finale. */
  const flick = (direction: 1 | -1) => {
    if (!frame) return;
    grab.current = {
      edge: direction === 1 ? EDGE.right : EDGE.left,
      t: 0.5,
    };
    if (reduceMotion) {
      advance(direction);
      return;
    }
    stopSettle();
    tension.set(1);
    const pluck = animate(pullX, direction * frame.maxStretchX * 0.6, QUICK);
    settle.current = [pluck];
    pluck.finished.then(() => advance(direction), () => {});
  };

  const beginPull =
    (edge: EdgeIndex) => (event: ReactPointerEvent<HTMLButtonElement>) => {
      const stage = stageRef.current;
      if (!frame || !stage || gesture.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const rect = stage.getBoundingClientRect();
      stopSettle();
      grab.current = {
        edge,
        t: edgeParam(frame.quad, edge, {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }),
      };
      gesture.current = {
        pointerId: event.pointerId,
        edge,
        originX: event.clientX,
        originY: event.clientY,
        outward: 0,
        travel: 0,
      };
      lastTravel.current = 0;
      capturePointer(event.currentTarget, event.pointerId);
    };

  const continuePull = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const active = gesture.current;
    if (!frame || !active || active.pointerId !== event.pointerId) return;

    const raw = event.clientX - active.originX;
    const outward = active.edge === EDGE.right ? raw : -raw;
    active.outward = outward;
    active.travel = Math.max(active.travel, Math.abs(raw));

    /* Verso il centro il filo è già teso sulle puntine: cede molto meno. */
    const stretch =
      outward >= 0
        ? resist(outward, frame.maxStretchX)
        : -resist(-outward, frame.maxStretchX * 0.14);

    pullX.set(active.edge === EDGE.right ? stretch : -stretch);
    pullY.set(resist(event.clientY - active.originY, frame.maxStretchY));
    tension.set(clamp(outward / frame.escape, 0, 1));

    if (outward >= frame.escape) endPull(event, true);
  };

  const endPull = (
    event: ReactPointerEvent<HTMLButtonElement>,
    escaped = false,
  ) => {
    const active = gesture.current;
    if (!frame || !active || active.pointerId !== event.pointerId) return;

    gesture.current = null;
    lastTravel.current = active.travel;
    releasePointer(event.currentTarget, event.pointerId);

    if (escaped || active.outward >= frame.release) {
      advance(active.edge === EDGE.right ? 1 : -1);
    } else {
      home(RELAX);
    }
  };

  const onHandleClick = (edge: EdgeIndex) => () => {
    /* Dopo un trascinamento il click arriva comunque: qui va ignorato. */
    if (lastTravel.current > 8) return;
    flick(edge === EDGE.right ? 1 : -1);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      flick(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      flick(-1);
    }
  };

  const clipStyle: CoverClipVars | CSSProperties = frame
    ? (() => {
        const box = quadBounds(frame.quad);
        return {
          clipPath: `url(#${clipId})`,
          "--clip-left": `${box.left}px`,
          "--clip-top": `${box.top}px`,
          "--clip-width": `${box.width}px`,
          "--clip-height": `${box.height}px`,
          "--bleed-x": `${frame.maxStretchX}px`,
          "--bleed-y": `${frame.maxStretchY}px`,
        };
      })()
    : { clipPath: `url(#${clipId})` };

  return (

    <div className={styles.wrapper}>
    <div className={styles.postitContainer}>
      <div className={styles.postit}> ➜</div>
      <div className={styles.postit}> ➜</div>
    </div>

      <div className={styles.bg}></div>
      <div className={styles.frame}></div>
      
      <div
        ref={stageRef}
        data-work-stage=""
        className={styles.stage}
        onKeyDown={onKeyDown}
        role="group"
        aria-roledescription="carosello"
        aria-label="Progetti"
      >
        {/*
          La maschera è applicata a questo nodo, che resta fermo: lo
          spostamento parallasse vive sul figlio, altrimenti trascinerebbe
          anche il `clip-path` e la finestra si muoverebbe con l'immagine.
        */}
        <div className={styles.cover} style={clipStyle}>
          <motion.div
            className={styles.coverInner}
            style={{ x: coverX, scale: coverScale }}
          >
            {PROJECTS.map((item, position) => (
              <div
                key={item.id}
                className={styles.coverSlide}
                style={{
                  opacity: position === index ? 1 : 0,
                  zIndex: position === index ? 1 : 0,
                  pointerEvents: position === index ? "auto" : "none",
                }}
                aria-hidden={position !== index}
              >
                <div className={styles.coverInfo}>
                  <div className={styles.coverInfoInner}>
                    <h5>{item.year}</h5>
                    <h3>{item.title}</h3>
                    <h4>{item.discipline}</h4>
                  </div>
                  <motion.button
                    type="button"
                    className={`${styles.coverInfoButton} siteBtn`}
                    tabIndex={position === index ? 0 : -1}
                    onClick={() => router.push(`/project/${item.id}`)}
                    style={{ backgroundColor: item.color1 }}
                  >
                    Discover
                  </motion.button>
                  
                </div>
                <div className={styles.coverLayer}>
                  <img
                    className={styles.coverImage}
                    src={item.cover}
                    alt={item.title}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {frame ? (
          <ThreadFrame
            className={styles.thread}
            size={frame.size}
            quad={frame.quad}
            thread={frame.thread}
            tails={frame.tails}
            pullX={pullX}
            pullY={pullY}
            grab={grab}
            clipId={clipId}
          />
        ) : null}

        {frame
          ? ([EDGE.left, EDGE.right] as EdgeIndex[]).map((edge) => (
              <button
                key={edge}
                type="button"
                className={styles.handle}
                style={handleBox(frame, edge)}
                aria-label={
                  edge === EDGE.right
                    ? "Tira il filo a destra: progetto successivo"
                    : "Tira il filo a sinistra: progetto precedente"
                }
                onPointerDown={beginPull(edge)}
                onPointerMove={continuePull}
                onPointerUp={endPull}
                onPointerCancel={endPull}
                onClick={onHandleClick(edge)}
              />
            ))
          : null}
      </div>
    </div>
  );
}
