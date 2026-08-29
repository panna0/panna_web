import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";

export function Services() {
  return (
    <Section id={SECTION_IDS.services}>
      <p className="text-sm tracking-[0.2em] uppercase text-foreground/50">
        Services
      </p>
    </Section>
  );
}
