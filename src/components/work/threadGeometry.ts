/*
  Matematica del filo in tensione: nessun React qui dentro, solo funzioni
  pure su punti. La cornice è un anello di quattro cubiche di Bézier con i
  vertici inchiodati alle puntine; la deformazione sposta solo i punti di
  controllo, mai i vertici.
*/

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };

/** Spessori letti dai token `--thread-*`, in px. */
export type ThreadMetrics = {
  thickness: number;
  highlight: number;
  shade: number;
  outline: number;
};

/** Vertici in senso orario: 0 alto-sinistra, 1 alto-destra, 2 basso-destra, 3 basso-sinistra. */
export type Quad = readonly [Point, Point, Point, Point];

export type EdgeIndex = 0 | 1 | 2 | 3;

/** Il lato `i` va da `quad[i]` a `quad[(i + 1) % 4]`. */
export const EDGE = {
  top: 0,
  right: 1,
  bottom: 2,
  left: 3,
} as const satisfies Record<string, EdgeIndex>;

/** Un lato del filo, come cubica di Bézier da `a` a `b`. */
export type Side = { a: Point; c1: Point; c2: Point; b: Point };
export type Sides = readonly [Side, Side, Side, Side];

/** Dove il filo è stato afferrato: su quale lato e a che parametro lungo il lato. */
export type Grab = { edge: EdgeIndex; t: number };

/**
 * La presa non arriva mai alle puntine: lì il filo è inchiodato e la pancia
 * richiederebbe uno spostamento infinito dei controlli (vedi `controlLift`).
 */
const T_LIMIT = 0.18;

/**
 * Quanto seguono i due lati adiacenti a quello tirato. Il controllo vicino
 * alla puntina caricata cede molto, quello lontano appena: è il modo in cui
 * la tensione si propaga lungo l'anello.
 */
const ADJACENT_NEAR = 0.3;
const ADJACENT_FAR = 0.08;

/** Il lato opposto viene risucchiato verso il lato tirato. */
const OPPOSITE = 0.1;

/** Sfalsamenti fissi: le puntine sembrano piantate a mano, non allineate al pixel. */
const PIN_OFFSET: readonly Point[] = [
  { x: 0, y: 0 },
  { x: 7, y: -9 },
  { x: -5, y: 8 },
  { x: 9, y: 5 },
];

export function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value;
}

/** Legge un token CSS in px, anche se è dichiarato in rem. */
export function readCssPx(
  css: CSSStyleDeclaration,
  name: string,
  fallback: number,
) {
  const raw = css.getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  if (raw.endsWith("rem")) {
    const root = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    return value * (Number.isFinite(root) ? root : 16);
  }
  return value;
}

/**
 * Resistenza dell'elastico: per piccoli spostamenti la risposta è quasi 1:1,
 * poi satura verso `max`. Il dito continua a correre ma il filo cede sempre
 * meno, e non esce mai dallo spazio libero attorno alla cornice.
 */
export function resist(distance: number, max: number) {
  const sign = distance < 0 ? -1 : 1;
  return sign * max * (1 - Math.exp(-Math.abs(distance) / max));
}

/** Quadrilatero inscritto nello stage, con le puntine sfalsate. */
export function buildQuad(size: Size, padX: number, padY: number): Quad {
  const left = padX;
  const right = size.width - padX;
  const top = padY;
  const bottom = size.height - padY;
  const corners: Point[] = [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
  const [a, b, c, d] = corners.map((corner, index) => ({
    x: corner.x + PIN_OFFSET[index].x,
    y: corner.y + PIN_OFFSET[index].y,
  }));
  return [a, b, c, d] as const;
}

export function quadCenter(quad: Quad): Point {
  return {
    x: (quad[0].x + quad[1].x + quad[2].x + quad[3].x) / 4,
    y: (quad[0].y + quad[1].y + quad[2].y + quad[3].y) / 4,
  };
}

/** Filo a riposo: controlli a 1/3 e 2/3 del segmento, quindi lati diritti. */
export function restSides(quad: Quad): Sides {
  const side = (index: EdgeIndex): Side => {
    const a = quad[index];
    const b = quad[(index + 1) % 4];
    return {
      a,
      c1: { x: a.x + (b.x - a.x) / 3, y: a.y + (b.y - a.y) / 3 },
      c2: { x: a.x + (2 * (b.x - a.x)) / 3, y: a.y + (2 * (b.y - a.y)) / 3 },
      b,
    };
  };
  return [side(0), side(1), side(2), side(3)] as const;
}

/**
 * Quanto vanno spostati i controlli perché la curva passi esattamente dal
 * punto afferrato.
 *
 * Su una cubica B(t) = (1−t)³a + 3(1−t)²t·c1 + 3(1−t)t²·c2 + t³b, spostare
 * c1 di u1 e c2 di u2 sposta il punto a parametro t di
 *   Δ(t) = 3(1−t)²t·u1 + 3(1−t)t²·u2.
 * Scelgo u1 = (1−t)·k·d e u2 = t·k·d — così la pancia pende verso il punto
 * afferrato invece di gonfiarsi simmetrica — e resta una sola incognita:
 *   k = 1 / (3t(1−t)[(1−t)² + t²]).
 * Con questo k vale Δ(t) = d esatto. A t = 0.5 dà il classico 4/3·d su
 * entrambi i controlli, e per t → 0 o 1 diverge: da qui `T_LIMIT`.
 */
function controlLift(t: number) {
  return 1 / (3 * t * (1 - t) * ((1 - t) ** 2 + t ** 2));
}

function shift(side: Side, first: Point, second: Point): Side {
  return {
    a: side.a,
    c1: { x: side.c1.x + first.x, y: side.c1.y + first.y },
    c2: { x: side.c2.x + second.x, y: side.c2.y + second.y },
    b: side.b,
  };
}

function scale(vector: Point, factor: number): Point {
  return { x: vector.x * factor, y: vector.y * factor };
}

/**
 * Anello deformato da una presa. `pull` è lo spostamento del punto afferrato:
 * il lato tirato ci passa esattamente attraverso, i due adiacenti si piegano
 * verso la puntina caricata, quello opposto viene risucchiato.
 */
export function deformSides(quad: Quad, grab: Grab, pull: Point): Sides {
  const rest = restSides(quad);
  if (pull.x === 0 && pull.y === 0) return rest;

  const t = clamp(grab.t, T_LIMIT, 1 - T_LIMIT);
  const lift = controlLift(t);

  const deformed = rest.map((side, index): Side => {
    if (index === grab.edge) {
      return shift(
        side,
        scale(pull, (1 - t) * lift),
        scale(pull, t * lift),
      );
    }
    if (index === (grab.edge + 2) % 4) {
      return shift(side, scale(pull, OPPOSITE), scale(pull, OPPOSITE));
    }
    /*
      Lato adiacente: condivide una sola puntina con quello tirato. Se la
      condivide come punto di partenza, il controllo che cede è il primo.
    */
    const sharesStart = index === (grab.edge + 1) % 4;
    return sharesStart
      ? shift(side, scale(pull, ADJACENT_NEAR), scale(pull, ADJACENT_FAR))
      : shift(side, scale(pull, ADJACENT_FAR), scale(pull, ADJACENT_NEAR));
  });

  return [deformed[0], deformed[1], deformed[2], deformed[3]] as const;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

/** Anello chiuso: serve sia al filo sia alla maschera dell'immagine. */
export function sidesToPath(sides: Sides) {
  let path = `M ${round(sides[0].a.x)} ${round(sides[0].a.y)}`;
  for (const side of sides) {
    path += ` C ${round(side.c1.x)} ${round(side.c1.y)} ${round(side.c2.x)} ${round(side.c2.y)} ${round(side.b.x)} ${round(side.b.y)}`;
  }
  return `${path} Z`;
}

/** Un solo lato: sopra ci passano il colmo di luce e l'ombra. */
export function sideToPath(side: Side) {
  return `M ${round(side.a.x)} ${round(side.a.y)} C ${round(side.c1.x)} ${round(side.c1.y)} ${round(side.c2.x)} ${round(side.c2.y)} ${round(side.b.x)} ${round(side.b.y)}`;
}

/*
  ─── Le code ────────────────────────────────────────────────────────────────
  Il filo non nasce e non muore sulla cornice: scende da sopra la sezione,
  si infila nella puntina in alto a sinistra, fa il giro dei perni e riparte
  da quella in basso, dove piega a sinistra e va a prendere il rail dei
  servizi. Le code non si deformano — sono ancorate — quindi le tengo come
  polilinee campionate: più semplici da rendere e da affiancare.
*/

/** Spazio disponibile attorno allo stage, in px. */
export type TailRoom = { up: number; down: number; left: number };
export type Tails = { entry: Point[]; exit: Point[] };

function sampleCubic(a: Point, c1: Point, c2: Point, b: Point, steps: number) {
  const points: Point[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps;
    const u = 1 - t;
    points.push({
      x:
        u ** 3 * a.x +
        3 * u ** 2 * t * c1.x +
        3 * u * t ** 2 * c2.x +
        t ** 3 * b.x,
      y:
        u ** 3 * a.y +
        3 * u ** 2 * t * c1.y +
        3 * u * t ** 2 * c2.y +
        t ** 3 * b.y,
    });
  }
  return points;
}

function sampleArc(
  center: Point,
  radius: number,
  from: number,
  to: number,
  steps: number,
) {
  const points: Point[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const angle = from + ((to - from) * step) / steps;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
}

export function buildTails(quad: Quad, size: Size, room: TailRoom): Tails {
  const top = quad[0];
  const bottom = quad[3];

  /*
    Entrata: scende da poco sopra la sezione Work (un accenno nell'intro,
    non tutto il documento) e si infila nella puntina alta a sinistra.
  */
  const bend = Math.min(160, Math.max(48, room.up * 0.45));
  const entry = [
    { x: top.x, y: -room.up },
    ...sampleCubic(
      { x: top.x, y: top.y - bend },
      { x: top.x, y: top.y - bend * 0.45 },
      { x: top.x, y: top.y - bend * 0.18 },
      top,
      12,
    ),
  ];

  /*
    Uscita: scende nel resto della sezione, poi un quarto di curva a
    sinistra e via, oltre il bordo della finestra. Di là il rail dei
    servizi lo riprende, alla sua quota.
  */
  const drop = Math.max(room.down - 28, 96);
  const radius = clamp(Math.min(drop * 0.38, room.left * 0.55, 140), 48, 140);
  const turnY = size.height + drop;
  const elbow = { x: bottom.x, y: turnY - radius };
  const center = { x: bottom.x - radius, y: elbow.y };
  const exit = [
    bottom,
    elbow,
    ...sampleArc(center, radius, 0, Math.PI / 2, 12),
    { x: -room.left, y: turnY },
  ];

  return { entry, exit };
}

/**
 * Ingresso del rail servizi: il filo rientra da sinistra, un poco sopra la
 * quota del rail, e si posa su di esso con un quarto di curva. Sta nella
 * fascia libera a sinistra della prima card, così non la taglia.
 */
export function buildRailLeadIn(railY: number, leftRoom: number): Point[] {
  const radius = 72;
  const center = { x: 0, y: railY };
  return [
    { x: -leftRoom, y: railY - radius },
    { x: 0, y: railY - radius },
    ...sampleArc(center, radius, -Math.PI / 2, 0, 12),
    { x: radius + 20, y: railY },
  ];
}

export function polylineToPath(points: Point[]) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`,
    )
    .join(" ");
}

/**
 * Parallela di una polilinea: ogni vertice scorre lungo la propria normale,
 * presa dalla media dei segmenti adiacenti. Una semplice traslazione, come
 * quella che uso sui lati diritti della cornice, sulle curve aprirebbe dei
 * buchi; qui la copia resta incollata al filo.
 *
 * La normale è sempre a sinistra del senso di marcia. Percorrendo le code
 * verso il basso e poi verso sinistra, questo mette il colmo di luce a
 * sinistra sui tratti verticali e in alto su quelli orizzontali: le stesse
 * scelte di `litNormal`, quindi le code e la cornice si leggono continue.
 */
export function offsetPolyline(points: Point[], distance: number): Point[] {
  return points.map((point, index) => {
    const previous = points[Math.max(0, index - 1)];
    const next = points[Math.min(points.length - 1, index + 1)];
    const tx = next.x - previous.x;
    const ty = next.y - previous.y;
    const length = Math.hypot(tx, ty) || 1;
    return {
      x: point.x + (-ty / length) * distance,
      y: point.y + (tx / length) * distance,
    };
  });
}

/** Proiezione del punto afferrato sul lato, in parametro 0–1 lontano dalle puntine. */
export function edgeParam(quad: Quad, edge: EdgeIndex, point: Point) {
  const a = quad[edge];
  const b = quad[(edge + 1) % 4];
  const vx = b.x - a.x;
  const vy = b.y - a.y;
  const length = vx * vx + vy * vy;
  if (length === 0) return 0.5;
  const t = ((point.x - a.x) * vx + (point.y - a.y) * vy) / length;
  return clamp(t, T_LIMIT, 1 - T_LIMIT);
}

/**
 * Direzione in cui sta il colmo di luce del lato, come versore normale.
 *
 * Sui lati orizzontali la luce arriva dall'alto, quindi il colmo sta in alto
 * anche sul lato inferiore — è la stessa lettura del rail dei servizi. Sui
 * lati verticali "alto" non vuol dire niente, e il colmo va verso l'esterno:
 * il filo legge come un cordino teso attorno alla cornice.
 */
export function litNormal(quad: Quad, edge: EdgeIndex): Point {
  const a = quad[edge];
  const b = quad[(edge + 1) % 4];
  const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const tangent = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
  const normal = { x: -tangent.y, y: tangent.x };

  const center = quadCenter(quad);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const pointsOut =
    normal.x * (mid.x - center.x) + normal.y * (mid.y - center.y) > 0;
  const outward = pointsOut ? normal : { x: -normal.x, y: -normal.y };

  if (Math.abs(outward.y) > 0.35) {
    return outward.y < 0 ? outward : { x: -outward.x, y: -outward.y };
  }
  return outward;
}
