import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";
import { ServicesSlider } from "@/components/services/ServicesSlider";
import styles from "./Services.module.css";

export function Services() {
  return (
    <Section
      id={SECTION_IDS.services}
      className="flex flex-col px-0 pt-24 pb-0 md:px-0 mt-20"
    >
    <div className={styles.titleContainer}>
      <h2 className={styles.title}>
        Services
      </h2>
      <p className={styles.description}>
      Each of my skills is a precise blend of tools and techniques. Scroll through these color cards to explore my expertise, and simply hover or tap to flip them and discover the ingredients on the back.
      </p>
    </div>
      <div className="mb-10 flex min-h-0 min-w-0 w-full max-w-full flex-1 items-center justify-center">
        <ServicesSlider />
      </div>
    </Section>
  );
}
