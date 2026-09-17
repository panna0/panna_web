import type { Point } from "./threadGeometry";

type PinProps = {
  at: Point;
  radius?: number;
};

/**
 * Puntina da bacheca vista dall'alto. Stessa ferramenta dei tondini delle
 * card servizi (corpo grigio, cuore nero, bordo nero), col raggio scelto per
 * coprire la giunzione tra due lati del filo.
 */
export function Pin({ at, radius = 21 }: PinProps) {
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <ellipse
        cx={2}
        cy={5}
        rx={radius}
        ry={radius * 0.92}
        fill="rgba(23, 23, 23, 0.22)"
      />
      <circle
        r={radius}
        strokeWidth={2}
        style={{ fill: "var(--pin-body)", stroke: "var(--thread-outline)" }}
      />
      <circle
        r={radius * 0.56}
        strokeWidth={2}
        style={{ fill: "var(--pin-core)", stroke: "var(--thread-outline)" }}
      />
      <circle
        cx={-radius * 0.32}
        cy={-radius * 0.36}
        r={radius * 0.16}
        fill="rgba(255, 255, 255, 0.6)"
      />
    </g>
  );
}
