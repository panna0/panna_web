"use client";

import { useEffect, useRef, useState } from "react";
import { motion, Transition } from "framer-motion";
import styles from "./ContactSection.module.css";
import Letter from "@/components/contact/Letter";
import { AnimatedThreadStroke } from "@/components/work/AnimatedThreadStroke";
import { readCssPx, type Point, type ThreadMetrics } from "@/components/work/threadGeometry";

/** Half-distance between the two string-tie washers. Keep in sync with Letter. */
const BUTTON_OFFSET_PX = 85;

function sampleArc(center: Point, radius: number, from: number, to: number, steps: number) {
  const points: Point[] = [];
  for (let step = 0; step <= steps; step += 1) {
    const angle = from + ((to - from) * step) / steps;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Salviamo entrambe le traiettorie nello stato
  const [paths, setPaths] = useState<{
    straight: Point[];
    sCurve: Point[];
    metrics: ThreadMetrics;
    buttonOffset: number;
  } | null>(null);
  
  // Stato per controllare quale forma stiamo mostrando
  const [isMorphed, setIsMorphed] = useState(false);
  const [isInteractable, setIsInteractable] = useState(false); 

  useEffect(() => {
    if (isMorphed) {
      const timer = setTimeout(() => setIsInteractable(true), 2000); 
      return () => clearTimeout(timer);
    }
    // Rimosso l'else: non serve forzare a false perché lo è già di default.
  }, [isMorphed]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const measure = () => {
      const { width, height } = section.getBoundingClientRect();
      const css = getComputedStyle(section);
      
      const metrics: ThreadMetrics = {
        thickness: readCssPx(css, "--thread-thickness", 30),
        highlight: readCssPx(css, "--thread-highlight-width", 5),
        shade: readCssPx(css, "--thread-shade-width", 4),
        outline: readCssPx(css, "--thread-outline-width", 2),
      };

      const offset = readCssPx(css, "--letter-button-offset", BUTTON_OFFSET_PX);

      const cx = width / 2; // Centro orizzontale
      const cy1 = height / 2 - offset; // Perno superiore
      const cy2 = height / 2 + offset; // Perno inferiore
      const R = Math.min(45, Math.max(28, offset * 0.55)); // Raggio dell'avvolgimento
      
      // Entrata dall'alto (centrata)
      const startPt = { x: cx, y: cy1 + offset};

      // Curva 1: Attorno al perno superiore.
      const curve1 = sampleArc({ x: cx, y: cy1 }, R, 0, -Math.PI, 12);
      
      const curve2 = sampleArc({ x: cx, y: cy2 }, R,  0, Math.PI, 12);
      const elbowTurn = { x: Math.min(cx + 200, Math.max(cx + 48, width - 24)), y: height / 2 };
      
      const center3 = { x: elbowTurn.x, y: elbowTurn.y + R };
      
      const curve3 = sampleArc(center3, R, -Math.PI / 2, 0, 12);

      const endPt = { x: center3.x + R, y: height + 200 };

      // Uniamo tutto per la forma a S (Figura 8)
      const figure8Path = [
        { x: -100, y: height/2 },
        startPt,
        ...curve2,
        ...curve1,
        startPt,
        elbowTurn,
        ...curve3,
        endPt
      ];
      
      // =========================================
      // CREAZIONE DELLA LINEA DRITTA
      // =========================================
      const simpleStartX = -100;
      const simpleEndX = elbowTurn.x;
      
      // Spalmiamo i primi 30 punti sulla linea dritta orizzontale
      const straightSection = Array.from({ length: 30 }).map((_, index) => ({
        x: simpleStartX + ((simpleEndX - simpleStartX) * index) / 29, 
        y: height / 2, 
      }));

      // Uniamo la linea dritta alla curva finale
      const simplePath = [
        ...straightSection,
        ...curve3,
        endPt
      ];

      setPaths({ straight: simplePath, sCurve: figure8Path, metrics, buttonOffset: offset });
    };

    const firstId = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    
    return () => {
      cancelAnimationFrame(firstId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!paths) return;
    const timer = setTimeout(() => setIsMorphed(true), 1500);
    return () => clearTimeout(timer);
  }, [paths]);

  return (
    <motion.section 
      ref={sectionRef} 
      className={styles.section} 
      onViewportEnter={() => setIsMorphed(true)}
      viewport={{ once: true }}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.titles}>
        <h4 className={styles.title}>Contact Me</h4>
        <p className={styles.description}>The thread ends here, but our conversation is just starting. Hover or tap the envelope to open it and get in touch.</p>
      </div>
      
      <Letter buttonOffset={paths?.buttonOffset ?? BUTTON_OFFSET_PX} isMorphed={isInteractable}/>

      {paths && (
        <svg className={styles.svgLayer}>
          <AnimatedThreadStroke 
            // @ts-expect-error: Framer Motion motion.path tipi in conflitto con l'array di coordinate Point[] custom
            points={isMorphed ? paths.straight : paths.sCurve} 
            thread={paths.metrics} 
            shadow={true}
            initial={false}
            transition={{ 
              type: "spring",
              stiffness: 20,
              damping: 5,
              delay: 1.5,
              duration: 1.2, 
              ease: "easeInOut" 
            } as Transition}
          />
        </svg>
      )}

      <div className={styles.content}>
         {/* Contenuto eventuale */}
      </div>
    </motion.section>
  );
}