import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";

export function Contact() {
  return (
    <Section id={SECTION_IDS.contact}>
      <p className="text-sm tracking-[0.2em] uppercase text-foreground/50">
        Contact
      </p>
    </Section>
  );
}
