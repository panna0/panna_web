import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";

export function Work() {
  return (
    <Section id={SECTION_IDS.work} className="bg-foreground/[0.03]">
      <p className="text-sm tracking-[0.2em] uppercase text-foreground/50">
        Work
      </p>
    </Section>
  );
}
