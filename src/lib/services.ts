export type ServiceIconId =
  | "identity"
  | "direction"
  | "digital"
  | "content"
  | "strategy"
  | "consulting";

export type ServiceSkill = {
  name: string;
  level: number;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: ServiceIconId;
  /** Colore del testo e dei bordi. */
  color1: string;
  /** Colore di riempimento. */
  color2: string;
  skills: ServiceSkill[];
};

export const SERVICES: Service[] = [
  {
    id: "WEB",
    title: "Web Frontend",
    description:
      "Sistemi visivi, naming e linguaggi che restano riconoscibili nel tempo.",
    icon: "identity",
    color1: "#2488C4",
    color2: "#6ADED0",
    skills: [
      {
        name: "HTML/CSS/JS",
        level: 16,
      },
      {
        name: "React",
        level: 12,
      },
      {
        name: "Next.js",
        level: 8,
      },
      {
        name: "Figma",
        level: 4,
      },
      {
        name: "Git",
        level: 2,
      },
    ]

  },
  {
    id: "APP",
    title: "App Frontend",
    description:
      "Direzione creativa per campagne, editoriali e mondi visivi coerenti.",
    icon: "direction",
    color1: "#92326A",
    color2: "#FFE4A1",
    skills: [
      {
        name: "Kotlin",
        level: 16,
      },
      {
        name: "Jetpack Compose",
        level: 12,
      },
      {
        name: "MVVM Architecture",
        level: 8,
      },
      {
        name: "Figma",
        level: 4,
      },
      {
        name: "Git",
        level: 2,
      },
    ],
  },
  {
    id: "GDD",
    title: "Graphic Design",
    description:
      "Interfacce e siti che tengono insieme forma, ritmo e usabilità.",
    icon: "digital",
    color1: "#2A9D8F",
    color2: "#80B0F3",
    skills: [
      {
        name: "Adobe Illustrator",
        level: 16,
      },
      {
        name: "Adobe Photoshop",
        level: 12,
      },
      {
        name: "Adobe InDesign",
        level: 8,
      },
  
    ],
  },
  {
    id: "ILL",
    title: "Illustration",
    description:
      "Narrazione, immagine in movimento e materiali che danno voce al brand.",
    icon: "content",
    color1: "#FEB7BB",
    color2: "#FF9BA4",
    skills: [
      {
        name: "Procreate",
        level: 16,
      },
      {
        name: "Adobe Illustrator",
        level: 12,
      },
      {
        name: "Blender",
        level: 8,
      },
  
    ],
  },
  
];
