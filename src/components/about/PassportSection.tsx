"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./PassportSection.module.css";
import Passport from "@/components/about/Passport";
import { ThreadStroke } from "@/components/work/ThreadStroke";
import { motion } from "framer-motion";
import { 
  readCssPx,
  type Size, 
  type ThreadMetrics,
  type Tails,
  type Point
} from "../work/threadGeometry";



function buildBindingStitches(passWidth: number, passHeight: number): Point[][] {
  const y = passHeight / 2;
  const isNarrow = passWidth < 520;

  const inset = Math.max(12, passWidth * 0.07);
  const usable = Math.max(0, passWidth - inset * 2);
  const stitchLen = Math.max(16, Math.min(isNarrow ? 34 : 50, usable * (isNarrow ? 0.11 : 0.082)));
  const gap = stitchLen * (isNarrow ? 1.2 : 1);
  const unit = stitchLen + gap;
  const maxCount = isNarrow ? 4 : 7;
  const count = Math.max(3, Math.min(maxCount, Math.floor((usable + gap) / unit)));
  const total = count * stitchLen + (count - 1) * gap;
  const start = (passWidth - total) / 2;

  return Array.from({ length: count }, (_, index) => {
    const x = start + index * (stitchLen + gap);
    return [
      { x, y },
      { x: x + stitchLen, y },
    ];
  });
}

export default function PassportSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const passportRef = useRef<HTMLDivElement>(null);

  const [layout, setLayout] = useState<{ size: Size; tails: Tails; thread: ThreadMetrics } | null>(null);
  // Unico stato per tutte le cuciture: "stitches" è un array di array di punti
  const [sewing, setSewing] = useState<{ stitches: Point[][]; thread: ThreadMetrics } | null>(null);

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

  useEffect(() => {
    const section = sectionRef.current;
    const passport = passportRef.current;
    if (!section || !passport) return;

    const measure = () => {
      const { width, height } = section.getBoundingClientRect();
      const { width: passWidth, height: passHeight } = passport.getBoundingClientRect();
      const css = getComputedStyle(section);
      const isMobile = width < 520;

      
      // Metriche del filo grande di sfondo
      const thread: ThreadMetrics = {
        thickness: readCssPx(css, "--thread-thickness", 30),
        highlight: readCssPx(css, "--thread-highlight-width", 5),
        shade: readCssPx(css, "--thread-shade-width", 4),
        outline: readCssPx(css, "--thread-outline-width", 2),
      };

      // Metriche del filo per la cucitura (solitamente più sottile)
      

      const radius = isMobile ? 40 : 80; 

      const start = isMobile ? { x: width+100, y: -80 } : { x: width+100, y: -200 };

      const elbow1 = isMobile ? { x: 45, y: -80 } : { x: 200, y: -200 }; 
      const center1 = { x: elbow1.x, y: elbow1.y + radius }; 
      const curve1 = sampleArc(center1, radius, -Math.PI / 2, -Math.PI, 12);

      const elbow2 = { x: center1.x - radius, y: center1.y }; 
      const elbow3 = { x: elbow2.x, y: height/2 - radius } ;
      const center2 = { x: elbow3.x + radius, y: elbow3.y};
      const curve2 = sampleArc(center2, radius, Math.PI, Math.PI / 2, 12);
      const elbow4 = { x: center2.x, y: center2.y + radius };
      const elbow5 = isMobile ? { x: width - 45, y: elbow4.y } : { x: width - 120 - radius, y: elbow4.y };
      const center3 = { x: elbow5.x, y : elbow5.y + radius};
      const curve3 = sampleArc(center3, radius, -Math.PI / 2, 0, 12);
      const elbow6 = { x: elbow5.x + radius, y: center3.y};
      const center4 = { x: elbow6.x -radius, y: height + radius};
      const curve4 = sampleArc(center4, radius, 0, Math.PI / 2, 12);


      const customTail = [
        start,
        elbow1,                   
        ...curve1,                
        elbow2, 
        elbow3,
        ...curve2,
        elbow4,
        elbow5,
        ...curve3,
        elbow6,
        { x: elbow6.x, y: height },
        ...curve4,
        { x: -100, y: height + radius*2 },
      ];

      const stitches = buildBindingStitches(passWidth, passHeight);

      setLayout({ size: { width, height }, tails: { entry: customTail, exit: [] }, thread });
      setSewing({ stitches, thread: thread });
    };

    const firstId = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    
    return () => {
      cancelAnimationFrame(firstId);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      
      {/* BACKGROUND LAYER: Il filo grande in SVG */}
      {layout && (
        <svg 
          style={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
            pointerEvents: 'none', zIndex: 0, overflow: 'visible' 
          }}
        >
          <ThreadStroke points={layout.tails.entry} thread={layout.thread} shadow={true} />
        </svg>
      )}
        <h3 className={styles.title}>ABOUT ME</h3>


      {/* FOREGROUND LAYER: Il Passaporto */}
      <div ref={passportRef} className={styles.contentWrapper} style={{ position: 'relative', zIndex: 1 }}>
        <Passport/>
        
        <motion.div className={styles.sewing} initial={{ opacity: 0 }} animate={{ opacity: 1 }} viewport={{ once: true, amount: 0.9 }} transition={{ type: 'tween', stiffness: 40, damping: 14 }}>
          {sewing && (
            <svg 
              style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                pointerEvents: 'none', zIndex: 2, overflow: 'visible' 
              }}
            >
              {/* Iteriamo sull'array di cuciture e renderizziamo un Thread per ognuna */}
              {sewing.stitches.map((stitchPoints, index) => (
                <ThreadStroke 
                  key={index} 
                  points={stitchPoints} 
                  thread={sewing.thread} 
                  shadow={true} 
                />
              ))}
            </svg>
          )}
        </motion.div>
      </div>

    </section>
  );
}