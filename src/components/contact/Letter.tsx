"use client";

import {
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import styles from "./Letter.module.css";

export type LetterButtonPosition = {
  x?: string;
  y?: string;
};

export type LetterProps = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  buttonOffset?: number | string;
  buttonSize?: number | string;
  buttonTop?: LetterButtonPosition;
  buttonBottom?: LetterButtonPosition;
  isMorphed?: boolean;
};

type LetterVars = CSSProperties & {
  "--letter-button-offset"?: string;
  "--letter-button-size"?: string;
  "--letter-button-top-x"?: string;
  "--letter-button-top-y"?: string;
  "--letter-button-bottom-x"?: string;
  "--letter-button-bottom-y"?: string;
};

function cssLen(value: number | string | undefined): string | undefined {
  if (value == null) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

const PAGE_SPRING: Transition = {
  type: "spring",
  stiffness: 30,
  damping: 10,
};

export default function Letter({
  className,
  style,
  children,
  buttonOffset,
  buttonSize,
  buttonTop,
  buttonBottom,
  isMorphed,
}: LetterProps) {
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    // Permetti il click solo se il filo si è srotolato
    if (isMorphed) {
      setIsOpen(!isOpen);
    }
  };

  const vars: LetterVars = {
    ...(buttonOffset != null ? { "--letter-button-offset": cssLen(buttonOffset) } : null),
    ...(buttonSize != null ? { "--letter-button-size": cssLen(buttonSize) } : null),
    ...(buttonTop?.x != null ? { "--letter-button-top-x": buttonTop.x } : null),
    ...(buttonTop?.y != null ? { "--letter-button-top-y": buttonTop.y } : null),
    ...(buttonBottom?.x != null ? { "--letter-button-bottom-x": buttonBottom.x } : null),
    ...(buttonBottom?.y != null ? { "--letter-button-bottom-y": buttonBottom.y } : null),
    ...style,
  };

  const flapTransition: Transition = reduceMotion ? { duration: 0 } : PAGE_SPRING;
  const paperOpenTransition: Transition = reduceMotion ? { duration: 0 } : { ...PAGE_SPRING, delay: 0.12 };
  const paperCloseTransition: Transition = reduceMotion ? { duration: 0 } : PAGE_SPRING;

  return (
    <motion.div
      className={className ? `${styles.root} ${className}` : styles.root}
      style={vars}
      initial="rest"
      // Usa lo stato isOpen per determinare l'animazione di base
      animate={isOpen ? "open" : "rest"}
      // Mantieni l'hover e il focus per aprire la busta in modo temporaneo
      whileHover={isMorphed ? "open" : "rest"}
      whileFocus={isMorphed ? "open" : "rest"}
      onClick={handleClick}
      tabIndex={0}
      aria-label="Busta con bottone e spago. Clicca o passa il cursore per aprire."
    >
      <div className={styles.shell}>
        <div className={styles.back} aria-hidden="true" />

        <motion.div
          className={styles.paper}
          variants={{
            rest: { y: "6%", z: 4, transition: paperCloseTransition },
            open: { y: "-100%", z: 4, transition: paperOpenTransition },
          }}
        >
          {children ?? (
            <>
              <h2 className={styles.letterhead}>HI!</h2>
              <span className={styles.rule} aria-hidden="true" />
              <p>
              Got a project in mind? Let's follow the thread and bring it to life.
              </p>
              <h3>Mail:</h3>
              <p> aripanna.ferri@gmail.com</p>
              <a
                href="mailto: aripanna.ferri@gmail.com"
                className={`${styles.button} siteBtn`}
                onClick={(event) => event.stopPropagation()}
              >
                Get in touch
              </a>
              
            </>
          )}
        </motion.div>

        <div className={styles.front} aria-hidden="true">
          <svg
            className={styles.frontSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line className={styles.fold} x1="50" y1="50" x2="0" y2="100" />
            <line className={styles.fold} x1="50" y1="50" x2="100" y2="100" />
            <polyline
              className={styles.pocketEdge}
              points="0,18 50,50 100,18"
            />
          </svg>
        </div>

        <motion.div
          className={styles.flap}
          style={{ originX: 0.5, originY: 0 }}
          variants={{
            rest: { rotateX: 0, z: 12, transition: flapTransition },
            open: {
              rotateX: reduceMotion ? 0 : 180,
              z: 12,
              transition: flapTransition,
            },
          }}
          aria-hidden="true"
        >
          <div className={`${styles.flapFace} ${styles.flapFront}`}>
            <svg
              className={styles.flapSvg}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <polygon
                className={styles.flapOutline}
                points="0,0 100,0 100,36 50,100 0,36"
              />
            </svg>
          </div>
          <div className={`${styles.edge} ${styles.edgeHinge}`} />
          <div className={`${styles.edge} ${styles.edgeLeft}`} />
          <div className={`${styles.edge} ${styles.edgeRight}`} />
          <div className={`${styles.flapFace} ${styles.flapInside}`}>
            <svg
                className={styles.flapSvg}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                >
                <polygon
                    className={styles.flapOutline}
                    points="100,64 50,0 50,0 0,64 0,100 100,100"
                />
                </svg>
          </div>
          <span
            className={`${styles.washer} ${styles.washerTop}`}
            data-letter-button="top"
          />
        </motion.div>
      </div>

      <div className={styles.hardware} aria-hidden="true">
        <span
          className={`${styles.washer} ${styles.washerBottom}`}
          data-letter-button="bottom"
        />
      </div>
    </motion.div>
  );
}