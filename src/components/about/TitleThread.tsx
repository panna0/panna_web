"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import styles from "./TitleThread.module.css";

const tracciatoDritto = "M5 5C4.99957 110.96 5.18709 229.587 5.18812 294.688C30.4805 294.688 48.7886 294.688 56.8559 294.688C63.0541 294.688 66.3523 294.688 72.3529 294.688C78.3536 294.688 84.7938 294.688 90.0877 294.688C95.3817 294.688 98.6572 294.688 103.711 294.688C108.765 294.688 143.696 294.688 172.137 294.688C196.969 294.688 181.824 294.688 211.713 294.688C220.249 294.688 211.638 294.688 263.447 294.688C283.106 294.688 300.806 294.688 318.284 294.688C344.78 294.688 326.562 294.688 332.77 294.688C337.943 294.688 343.183 294.688 350.359 294.688C358.961 294.688 410.459 295.731 423.884 295.731C437.31 295.731 430.656 295.731 452.011 295.731C481.828 295.731 472.502 295.731 481.066 295.731C491.058 295.731 481.396 295.731 490.89 295.731C498.921 295.731 503.101 295.731 507.097 295.731C513.925 295.731 520.756 295.731 528.746 295.731C536.735 295.731 554.985 295.731 565.98 295.731C576.976 295.731 590.221 295.731 597.49 295.731C606.232 295.731 604.673 295.731 608.519 295.731C612.364 295.731 634.73 295.731 639.598 295.731C645.55 295.731 653.775 295.731 658.738 295.731C663.701 295.731 688.721 295.731 691.536 295.731C694.352 295.731 698.312 295.731 701.513 295.731C704.715 295.731 734.516 295.731 744.177 295.731C751.855 295.731 754.792 295.73 761.516 295.731C764.736 295.732 768.145 295.731 775.139 295.732C780.341 295.732 791.735 295.732 798.67 295.732C808.33 295.732 817 295.732 823.935 295.732C829.385 295.732 841.783 295.218 884.634 295.218C890.074 295.218 903.277 295.214 922.981 295.21C922.981 372.526 922.413 507.26 922.413 594.997"; 
const tracciatoCorsivo = "M5.00009 5C4.99859 149.43 5.01629 169.288 5.01422 294.638C58.1209 293.846 97.3434 292.544 109.504 290.482C164.996 281.069 205.762 227.541 158.082 194.536C144.805 185.345 116.12 176.552 102.846 176.552C102.846 274.938 94.339 299.029 137.078 294.755C179.817 290.482 246.063 271.249 259.419 246.14C272.775 221.03 233.776 219.962 219.351 246.14C204.927 272.317 212.94 302.769 264.761 290.482C316.582 278.194 336.35 230.647 340.623 218.359C361.459 233.852 391.376 247.742 386.568 286.208C383.897 306.509 350.774 310.248 350.24 290.482C349.706 270.715 423.363 257.718 426.676 233.792C429.989 209.866 423.435 296.167 453.25 295.799C483.065 295.431 515.319 289.679 522.313 251.03C527.594 221.848 485.872 223.07 485.872 251.03C485.872 276.094 539.981 313.973 531.147 334.586C522.313 355.199 493.704 356.121 492.129 337.899C489.553 308.084 555.809 298.514 567.22 261.705C578.631 224.896 597.402 234.834 599.243 254.343C601.083 273.851 599.979 290.415 609.917 287.839C619.856 285.262 623.905 237.411 640.837 238.883C657.769 240.355 645.254 274.22 659.977 285.63C674.701 297.041 724.025 277.164 726.97 251.03C729.914 224.896 701.203 228.576 699.363 241.091C697.523 253.607 693.842 292.256 741.694 290.047C789.545 287.839 784.76 255.079 786.233 233.362C787.705 211.644 771.141 214.221 771.141 221.215C771.141 228.208 791.754 226.736 811.631 238.883C831.508 251.03 811.263 267.226 822.306 285.63C828.099 295.286 843.022 295.286 885.874 295.286C891.308 295.286 905.109 295.281 924.652 295.277C924.652 379.123 924.228 542.606 924.228 600.497";

export default function TitleThread() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, {
    margin: "-50% -10px -50% 0px",
    once: false,
  });

  const baseAnimation = {
    animate: { d: isInView ? tracciatoCorsivo : tracciatoDritto },
    transition: {
      duration: 1.5,
      ease: "easeInOut",
      type: "spring",
      stiffness: 80,
      damping: 12,
      mass: 1,
    },
    fill: "transparent",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <section 
      ref={sectionRef} 
      className={styles.titleContainer}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "20vh" }}
    >
      <div className={styles.threadContainer}>
        <svg
          className={styles.threadSvg}
          viewBox="-540 100 1000 250"
        >
          <defs>
            {/* AGGIUNTO: filterUnits="userSpaceOnUse" previene il bug del taglio quando il tracciato è dritto */}
            <filter id="thread-volume" filterUnits="userSpaceOnUse" x="-100" y="-100" width="2000" height="1000">
              <feOffset dx="4" dy="4" in="SourceAlpha" result="lightShift" />
              <feComposite in="SourceAlpha" in2="lightShift" operator="out" result="lightMask" />
              <feFlood floodColor="white" floodOpacity="0.3" result="lightColor" />
              <feComposite in="lightColor" in2="lightMask" operator="in" result="light" />

              <feOffset dx="-4" dy="-4" in="SourceAlpha" result="shadeShift" />
              <feComposite in="SourceAlpha" in2="shadeShift" operator="out" result="shadeMask" />
              <feFlood floodColor="black" floodOpacity="0.4" result="shadeColor" />
              <feComposite in="shadeColor" in2="shadeMask" operator="in" result="shade" />

              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="light" />
                <feMergeNode in="shade" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Ombra proiettata sulla pagina (Mantenuto solo il translate + blur. Niente drop-shadow finto CSS) */}
          <motion.path
            {...baseAnimation}
            stroke="var(--thread-shadow, rgba(0,0,0,0.2))"
            style={{filter: "blur(6px)"}} 
            strokeWidth="var(--thread-thickness)"
            transform="translate(10, 10)"
          />

          {/* 2. Bordo nero esterno */}
          <motion.path
            {...baseAnimation}
            stroke="var(--thread-outline, #171717)"
            strokeWidth="calc(var(--thread-thickness) + var(--thread-outline-width) * 2)"
          />

          {/* 3. Corpo del filo (colore base + Filtro 3D) */}
          <motion.path
            {...baseAnimation}
            stroke="var(--thread-color, #e5e5e5)"
            strokeWidth="var(--thread-thickness)"
            filter="url(#thread-volume)" 
          />
        </svg>
      </div>
    </section>
  );
}