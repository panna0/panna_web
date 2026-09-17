"use client";

import { motion } from "framer-motion";
import styles from "./MenuTag.module.css";

type MenuTagProps = {
  label: string;
  index: number;       // Da 1 a 4
  total?: number;      // Totale linguette (default 4)
  isActive: boolean;
  onClick: () => void;
  color?: string; 
  hasTag?: boolean; 
  children?: React.ReactNode;    // Per dare un colore diverso a ogni foglio (es. colori Pantone)
};

export function MenuTag({ 
  label, 
  index, 
  total = 4, 
  isActive, 
  onClick,
  color = "#faeed7",
  hasTag = true,
  children,
}: MenuTagProps) {
  
  // Calcola la posizione orizzontale della linguetta
  const widthPercent = 50 / total;
  const leftPosition = `${(index - 1) * widthPercent}%`;

  return (
    <motion.div
      className={styles.sheetWrapper}
      // La magia meccanica: z-index porta avanti, 'y' simula l'estrazione fisica
      animate={{
        zIndex: isActive ? 10 : index,
        y: isActive ? 0 : -16, 
        scale: isActive ? 1 : 0.98, // Leggerissima deformazione prospettica
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25, 
        mass: 0.8 
      }}
      style={{ zIndex: index, boxShadow: isActive ? "0px 22px 0px rgba(23, 23, 23, 0.16)" : "none" }}
    >
      {/* IL FOGLIO (Largo quanto tutta la navbar) */}
      <div 
        className={styles.sheetBody} 
      >
      {children}
      </div>

      {hasTag && (  
      
      <button
        type="button"
        className={styles.tab}
        style={{
          right: leftPosition,
          width: `${widthPercent}%`,
          backgroundColor: color,
        }}
        onClick={onClick}
        aria-current={isActive ? "page" : undefined}
      >
        <span className={styles.label}>{label}</span>
      </button>)}
    </motion.div>
  );
}