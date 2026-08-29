import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";

export function About() {
  return (
    <Section id={SECTION_IDS.about} className="bg-foreground/[0.03]">
      <p className="text-sm tracking-[0.2em] uppercase text-foreground/50">
        About
      </p>
    </Section>
  );
}
