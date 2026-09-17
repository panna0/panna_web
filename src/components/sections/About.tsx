'use client';

import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";
import PassportSection from "@/components/about/PassportSection";

export function About() {
  return (
    <Section
      id={SECTION_IDS.about}
      className="flex flex-col items-center justify-center  px-4 pt-24 md:px-6"
    >
        <PassportSection />
    </Section>
  );
}
