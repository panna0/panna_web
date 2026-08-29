import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";

export function Intro() {
  return (
    <Section id={SECTION_IDS.intro}>
      <p className="text-sm tracking-[0.2em] uppercase text-foreground/50">
        Intro
      </p>
    </Section>
  );
}
