import Link from "next/link";
import { sectionHref, SECTION_IDS } from "@/lib/navigation";
import { getAdjacentProjects, type Project } from "@/lib/projects";
import styles from "./WorkDetail.module.css";

type WorkDetailProps = {
  project: Project;
};

export function WorkDetail({ project }: WorkDetailProps) {
  const { previous, next } = getAdjacentProjects(project.id);

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.info} style={{ backgroundColor: project.color1 }}>
          <div className={styles.card}>
            <Link href={sectionHref(SECTION_IDS.work)} className={`${styles.back} siteBtn`}>
              ← Works
            </Link>

            <h1 className={styles.title}>{project.title}</h1>

            <dl className={styles.meta}>
              <div className={styles.metaRow}>
                <dt>Scope</dt>
                <dd>{project.discipline}</dd>
              </div>
              <div className={styles.metaRow}>
                <dt>Date</dt>
                <dd>{project.year}</dd>
              </div>
              {project.url ? (
                <div className={styles.metaRow}>
                  <dt>Website</dt>
                  <dd>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {project.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={styles.descriptionBlock}>
              <p className={styles.label}>Description</p>
              <p className={styles.description}>{project.description}</p>
            </div>
          </div>

          {previous && next ? (
            <nav className={styles.nav} aria-label="Altri lavori">
              <Link
                href={`/project/${previous.id}`}
                className={`${styles.postit} ${styles.postitPrev} siteBtn siteBtnPrev`}
                aria-label={`Progetto precedente: ${previous.title}`}
              >
                <p>➜</p>
              </Link>
              <p className={`${styles.postit} ${styles.postitLabel}`}>
                Use arrows to see more works
              </p>
              <Link
                href={`/project/${next.id}`}
                className={`${styles.postit} ${styles.postitNext} siteBtn`}
                aria-label={`Progetto successivo: ${next.title}`}
              >
                ➜
              </Link>
            </nav>
          ) : null}
        </aside>

        <section
          className={styles.gallery}
          aria-label={`Immagini di ${project.title}`}
        >
          {project.images.map((src, index) => (
            <figure key={src} className={styles.shot}>
              <img
                className={styles.shotImage}
                src={src}
                alt={`${project.title}, ${index + 1} di ${project.images.length}`}
              />
            </figure>
          ))}
        </section>
      </div>
    </main>
  );
}
