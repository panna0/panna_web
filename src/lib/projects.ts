export type Project = {
  id: string;
  title: string;
  discipline: string;
  year: string;
  description: string;
  /** Copertina in `public/…`. */
  cover: string;
  /** Sequenza della galleria in pagina dettaglio. */
  images: string[];
  /** Accento UI (bottone Discover). */
  color1: string;
  /** Sito live del progetto, se esiste. */
  url?: string;
};

function shots(folder: string, count = 5) {
  return Array.from({ length: count }, (_, index) => `/${folder}/${index + 1}.png`);
}

export const PROJECTS: Project[] = [
  {
    id: "adhdruid",
    title: "ADHDruid",
    discipline: "Game, Illustration",
    year: "2026",
    description:
      "Identità e illustrazione per un rito da tavolo: carte, gemme e un’app che tiene il calderone. Un mondo boschivo, magico e un po’ disordinato, come deve essere.",
    cover: "/adhdruid/1.png",
    images: shots("adhdruid"),
    color1: "#9B8CFF",
  },
  {
    id: "biteswipe",
    title: "BiteSwipe",
    discipline: "App, UI",
    year: "2025",
    description:
      "Un’app per scegliere cosa cucinare con uno swipe. Interfaccia diretta, rosso acceso, ricette che si decidono con il pollice invece che con la lista della spesa.",
    cover: "/biteswipe/1.png",
    images: shots("biteswipe"),
    color1: "#FF5A4F",
  },
  {
    id: "coby",
    title: "Coby",
    discipline: "Web, Art Direction",
    year: "2026",
    description:
      "Sito e direzione artistica per un portfolio fotografico: nero, pietra, ritratto. Lo schermo è un foglio che lascia parlare prima le immagini.",
    cover: "/coby/1.png",
    images: shots("coby"),
    color1: "#D8D8D8",
    url: "https://communicatedby.com",
  },
  {
    id: "commander",
    title: "Commander",
    discipline: "App, UI",
    year: "2025",
    description:
      "Piattaforma per creare, gestire e giocare partite di airsoft con gli amici. Timer, squadre, bosco: un’interfaccia da campo, non da dashboard.",
    cover: "/commander/1.png",
    images: shots("commander"),
    color1: "#7CFF6B",
  },
  {
    id: "filmposter",
    title: "Film Poster",
    discipline: "Illustration, Graphic Design",
    year: "2024",
    description:
      "Serie di poster Pixar ridotti all’essenziale: una lettera, un gesto, un colore. Tipografia che diventa scena, da muro e da metrò.",
    cover: "/filmposter/1.png",
    images: shots("filmposter"),
    color1: "#80B0F3",
  },
  {
    id: "rem",
    title: "Rem",
    discipline: "Editorial, Illustration",
    year: "2025",
    description:
      "Un compendio digitale di viaggi onirici. Copertina, impaginato e illustrazione per una rivista che si legge a letto, o a colazione, tra un caffè e un salto col paracadute.",
    cover: "/rem/1.png",
    images: shots("rem"),
    color1: "#F4C7B8",
  },
];

export function getProjectById(id: string) {
  return PROJECTS.find((project) => project.id === id);
}

/** Neighbors in the works list; first and last wrap around. */
export function getAdjacentProjects(id: string) {
  const index = PROJECTS.findIndex((project) => project.id === id);
  if (index === -1) {
    return { previous: undefined, next: undefined };
  }

  const last = PROJECTS.length - 1;
  return {
    previous: PROJECTS[index === 0 ? last : index - 1],
    next: PROJECTS[index === last ? 0 : index + 1],
  };
}
