import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";
import ContactSection from "@/components/contact/ContactSection";

export function Contact() {
  return (
    <Section
      id={SECTION_IDS.contact}
      className="flex flex-col items-center justify-center overflow-visible px-4 pt-24 md:px-6"
    >
      <ContactSection />
    </Section>
  );
}
