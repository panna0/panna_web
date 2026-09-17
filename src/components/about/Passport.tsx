"use client";

import { motion } from "framer-motion";
import styles from './Passport.module.css';
import ReactLogo  from "../../../public/logos/react.svg";
import FigmaLogo from "../../../public/logos/figma.svg";
import Photoshop from "../../../public/logos/photoshop.svg";

export default function Passport() {
  return (
    <div className={styles.passportWrapper}>
      
      {/* --- METÀ SUPERIORE DEL PASSAPORTO (Copertina + Pagina) --- */}
      <motion.div 
        className={`${styles.page3D} ${styles.pageTop3D}`}
        initial={{ rotateX: -90 }}
        whileInView={{ rotateX: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ type: "spring", stiffness: 80, damping: 8, mass: 1.5 }}
      >
        {/* L'esterno della copertina verde */}
        <div className={`${styles.face} ${styles.backFace}`}></div>
        
        {/* Lo spessore (bordi neri) della copertina rigida */}
        <div className={`${styles.edge} ${styles.edgeTop}`}></div>
        <div className={`${styles.edge} ${styles.edgeLeft}`}></div>
        <div className={`${styles.edge} ${styles.edgeRight}`}></div>

        {/* L'interno della copertina verde, che contiene la pagina di carta */}
        <div className={`${styles.face} ${styles.frontFace} ${styles.frontFaceTop}`}>
            <div className={`${styles.page} ${styles.pageTop}`}>
                <div className={`${styles.pageInner} ${styles.pageTopInner}`}>
                    <div className={styles.pageInnerContent}>
                        <div className={styles.idCard}>
                            <div className={styles.photoPlaceholder}>
                                {/* Qui potrai inserire la tua foto o un avatar stilizzato */}
                            </div>
                            
                            <div className={styles.idData}>
                                <div className={styles.dataGroup}>
                                    <p className={styles.label}>Name:</p>
                                    <p className={styles.value}>Panna</p>
                                </div>
                                <div className={styles.dataGroup}>
                                    <p className={styles.label}>Role:</p>
                                    <p className={styles.value}>Digital Designer</p>
                                </div>
                                <div className={styles.dataGroup}>
                                    <p className={styles.label}>MBTI:</p>
                                    <p className={styles.value}>INTP</p>
                                </div>
                                <div className={styles.dataGroup}>
                                    <p className={styles.label}>Education:</p>
                                    <p className={styles.value}>IED Milano</p>
                                </div>
                                <div className={styles.dataGroup}>
                                    <p className={styles.label}>Location:</p>
                                    <p className={styles.value}>Milano, Italy</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

      {/* --- GIUNTURA CENTRALE --- */}
      <div className={styles.binding}></div>

      {/* --- METÀ INFERIORE DEL PASSAPORTO (Copertina + Pagina) --- */}
      <motion.div 
        className={`${styles.page3D} ${styles.pageBottom3D}`}
        initial={{ rotateX: 90 }}
        whileInView={{ rotateX: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ type: "spring", stiffness: 80, damping: 8, mass: 1.5 }}
      >
        <div className={`${styles.face} ${styles.backFace}`}></div>
        
        <div className={`${styles.edge} ${styles.edgeBottom}`}></div>
        <div className={`${styles.edge} ${styles.edgeLeft}`}></div>
        <div className={`${styles.edge} ${styles.edgeRight}`}></div>

        <div className={`${styles.face} ${styles.frontFace} ${styles.frontFaceBottom}`}>
            <div className={`${styles.page} ${styles.pageBottom}`}>
                <div className={`${styles.pageInner} ${styles.pageBottomInner}`}>
                    <div className={styles.pageInnerContent}>
                        
                        <div className={styles.stampsGrid}>
                            <div className={`${styles.stamp} ${styles.stampFigma}`}>
                                <div className={`${styles.iconMask} ${styles.iconMaskFigma}`}>
                                </div>
                            </div>
                            <div className={`${styles.stamp} ${styles.stampReact}`}>
                                <div className={`${styles.iconMask} ${styles.iconMaskReact}`}>
                                </div>
                            </div>
                            <div className={`${styles.stamp} ${styles.stampPs}`}>
                                <div className={`${styles.iconMask} ${styles.iconMaskPs}`}>
                                </div>
                            </div>
                            <div className={`${styles.stamp} ${styles.stampGit}`}>
                                <div className={`${styles.iconMask} ${styles.iconMaskGit}`}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>

    </div>
  );
}