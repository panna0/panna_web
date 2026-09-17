import { SECTION_IDS } from "@/lib/navigation";
import { Section } from "@/components/Section";
import { WorkCarousel } from "@/components/work/WorkCarousel";
import styles from "./Work.module.css";

export function Work() {
  return (
    /*
      Nessun `overflow` qui: le code del filo sbordano dalla sezione, sopra e
      a sinistra, e devono passare. Non allargano la pagina perché il disegno
      di un SVG che esce dalla sua viewBox non conta come contenuto
      scorribile — e `overflow-x: clip` taglierebbe comunque anche in
      verticale.
    */
    <Section
      id={SECTION_IDS.work}
      className="flex flex-col px-0 pt-24 pb-0 md:px-0"
    >
      <div className={styles.titleContainer}>
        <p className={styles.description}>
        Take hold of the right thread and stretch it to bring the next project into view. If you need to retrace your steps, simply pull the left side of the frame to look back.
        </p>
        <h2 className={styles.title}>Work</h2>
      </div>
      <div className="flex min-h-0 w-full max-w-full flex-1 items-center justify-center">
        <WorkCarousel />
      </div>
    </Section>
  );
}
