import {
  offsetPolyline,
  polylineToPath,
  type Point,
} from "@/components/work/threadGeometry";
import type { ThreadMetrics } from "./threadGeometry";

type ThreadStrokeProps = {
  points: Point[];
  thread: ThreadMetrics;
  /** Ombra piatta sotto il filo, come sulle card. */
  shadow?: boolean;
};

/**
 * Un tratto di filo con la stessa anatomia del rail: bordo nero, corpo,
 * colmo di luce e fascia d'ombra. La `d` è una polilinea, così colmo e
 * ombra possono scorrere sulla parallela anche in curva.
 */
export function ThreadStroke({
  points,
  thread,
  shadow = true,
}: ThreadStrokeProps) {
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
        <path
          d={center}
          transform="translate(6 12)"
          strokeWidth={band}
          style={{ stroke: "var(--thread-shadow)" }}
        />
      ) : null}
      <path
        d={center}
        strokeWidth={band}
        style={{ stroke: "var(--thread-outline)" }}
      />
      <path
        d={center}
        strokeWidth={thread.thickness}
        style={{ stroke: "var(--thread-color)" }}
      />
      <path
        d={highlight}
        strokeWidth={thread.highlight}
        style={{ stroke: "var(--thread-highlight)" }}
      />
      <path
        d={shade}
        strokeWidth={thread.shade}
        style={{ stroke: "var(--thread-shade)" }}
      />
    </g>
  );
}
