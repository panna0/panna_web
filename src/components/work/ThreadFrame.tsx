"use client";

import { useEffect, useId, useRef, type RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { Pin } from "./Pin";
import { ThreadStroke } from "./ThreadStroke";
import {
  deformSides,
  litNormal,
  restSides,
  sideToPath,
  sidesToPath,
  type EdgeIndex,
  type Grab,
  type Quad,
  type Size,
  type Tails,
  type ThreadMetrics,
} from "./threadGeometry";

export type { ThreadMetrics };

type ThreadFrameProps = {
  className?: string;
  size: Size;
  quad: Quad;
  thread: ThreadMetrics;
  /** I due capi del filo: arriva dall'alto, riparte in basso verso sinistra. */
  tails: Tails;
  /** Spostamento del punto afferrato, in px. */
  pullX: MotionValue<number>;
  pullY: MotionValue<number>;
  /**
   * Presa corrente. È un ref e non uno stato perché cambia solo al
   * `pointerdown`: dopo, il ridisegno lo guidano `pullX` e `pullY`.
   */
  grab: RefObject<Grab | null>;
  /** Id della `clipPath` da cui l'immagine di copertina prende la maschera. */
  clipId: string;
};

const EDGES: EdgeIndex[] = [0, 1, 2, 3];

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function ThreadFrame({
  className,
  size,
  quad,
  thread,
  tails,
  pullX,
  pullY,
  grab,
  clipId,
}: ThreadFrameProps) {
  const scope = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const loopId = `${scope}-loop`;
  const sideId = (edge: EdgeIndex) => `${scope}-side-${edge}`;

  const loopRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const sideRefs = useRef<(SVGPathElement | null)[]>([]);

  /*
    Le geometrie vivono una volta sola in `<defs>` e vengono ridisegnate a
    mano: `<use>` le riprende per bordo, corpo, colmo, ombra e maschera. Così
    a ogni frame di trascinamento scrivo cinque attributi `d` e non passo da
    un render di React.
  */
  useEffect(() => {
    const draw = () => {
      const pull = { x: pullX.get(), y: pullY.get() };
      const grabbed = grab.current;
      const sides =
        grabbed && (pull.x !== 0 || pull.y !== 0)
          ? deformSides(quad, grabbed, pull)
          : restSides(quad);

      const loop = sidesToPath(sides);
      loopRef.current?.setAttribute("d", loop);
      clipRef.current?.setAttribute("d", loop);
      sides.forEach((side, edge) => {
        sideRefs.current[edge]?.setAttribute("d", sideToPath(side));
      });
    };

    draw();
    const unsubscribe = [pullX.on("change", draw), pullY.on("change", draw)];
    return () => unsubscribe.forEach((stop) => stop());
  }, [grab, pullX, pullY, quad]);

  const rest = restSides(quad);
  const restLoop = sidesToPath(rest);
  const highlightOffset = (thread.thickness - thread.highlight) / 2;
  const shadeOffset = (thread.thickness - thread.shade) / 2;
  const band = thread.thickness + thread.outline * 2;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${size.width} ${size.height}`}
      width={size.width}
      height={size.height}
      aria-hidden="true"
    >
      <defs>
        <path id={loopId} ref={loopRef} d={restLoop} fill="none" />
        {EDGES.map((edge) => (
          <path
            key={edge}
            id={sideId(edge)}
            ref={(element) => {
              sideRefs.current[edge] = element;
            }}
            d={sideToPath(rest[edge])}
            fill="none"
          />
        ))}
        {/*
          Coordinate in px dello stage: la stessa `d` serve a un elemento HTML
          fuori dall'SVG, quindi niente unità relative al bounding box.
        */}
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path ref={clipRef} d={restLoop} />
        </clipPath>
      </defs>

      {/*
        Ombra dipinta a mano invece di un `filter` CSS: il filtro si ritaglia
        sulla scatola dell'SVG e le code, che sbordano, resterebbero senza
        ombra — o peggio, invisibili. Qui è una copia traslata, e in più non
        costa un nuovo rasterizzo a ogni frame di trascinamento.
      */}
      <g transform="translate(6 12)" style={{ stroke: "var(--thread-shadow)" }}>
        <use
          href={`#${loopId}`}
          fill="none"
          strokeLinejoin="round"
          strokeWidth={band}
        />
      </g>

      {/*
        Le code stanno sotto la cornice: si incontrano al centro delle
        puntine, che coprono la giunzione. Non si deformano, quindi restano
        JSX statico senza scritture a mano.
      */}
      <ThreadStroke points={tails.entry} thread={thread} />
      <ThreadStroke points={tails.exit} thread={thread} />

      {/* Bordo nero come anello unico: gli angoli si chiudono senza giunte. */}
      <use
        href={`#${loopId}`}
        fill="none"
        strokeLinejoin="round"
        strokeWidth={band}
        style={{ stroke: "var(--thread-outline)" }}
      />
      <use
        href={`#${loopId}`}
        fill="none"
        strokeLinejoin="round"
        strokeWidth={thread.thickness}
        style={{ stroke: "var(--thread-color)" }}
      />

      {/*
        Colmo e ombra: lo stesso lato ridisegnato e traslato lungo la normale.
        Su una curva morbida una copia traslata approssima bene la parallela,
        e ciò che sborda agli angoli finisce sotto le puntine.
      */}
      {EDGES.map((edge) => {
        const normal = litNormal(quad, edge);
        return (
          <g key={edge}>
            <use
              href={`#${sideId(edge)}`}
              fill="none"
              strokeWidth={thread.highlight}
              style={{ stroke: "var(--thread-highlight)" }}
              transform={`translate(${round(normal.x * highlightOffset)} ${round(normal.y * highlightOffset)})`}
            />
            <use
              href={`#${sideId(edge)}`}
              fill="none"
              strokeWidth={thread.shade}
              style={{ stroke: "var(--thread-shade)" }}
              transform={`translate(${round(-normal.x * shadeOffset)} ${round(-normal.y * shadeOffset)})`}
            />
          </g>
        );
      })}

      {/* Raggio legato allo spessore: la puntina copre sempre la giunzione. */}
      {quad.map((pin, index) => (
        <Pin key={index} at={pin} radius={thread.thickness * 0.7} />
      ))}
    </svg>
  );
}
