export const SECTION_IDS = {
  intro: "intro",
  work: "work",
  services: "services",
  about: "about",
  contact: "contact",
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

export const NAV_LINKS = [
  { id: SECTION_IDS.contact, label: "Contact" },
  { id: SECTION_IDS.about, label: "About" },
  { id: SECTION_IDS.services, label: "Services" },
  { id: SECTION_IDS.work, label: "Works" },
] as const;

export function sectionHref(id: SectionId) {
  return `/#${id}`;
}
