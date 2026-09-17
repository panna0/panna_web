"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  NAV_LINKS,
  SECTION_IDS,
  sectionHref,
  type SectionId,
} from "@/lib/navigation";
import styles from "./NavBar.module.css";
import { MenuTag } from "./MenuTag";

const TAB_COLORS = ["#2488C4", "#2A9D8F", "#92326A", "#FEB7BB"];
const LABEL_ROTATIONS = [-2, 3, -1, 2];

const overlayTransition = {
  duration: 0.42,
  ease: [0.32, 0.72, 0, 1] as const,
};

type MobileMenuOverlayProps = {
  menuId: string;
  reduceMotion: boolean;
  onClose: () => void;
  onNavigate: (id: SectionId) => void;
};

function MobileMenuOverlay({
  menuId,
  reduceMotion,
  onClose,
  onNavigate,
}: MobileMenuOverlayProps) {
  "use no memo";
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      id={menuId}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      data-open={shown ? "true" : "false"}
      initial={reduceMotion ? { opacity: 0 } : { y: "-100vh" }}
      animate={
        reduceMotion
          ? { opacity: shown ? 1 : 0 }
          : { y: shown ? "0vh" : "-100vh" }
      }
      exit={reduceMotion ? { opacity: 0 } : { y: "-100vh" }}
      transition={overlayTransition}
    >
      <button
        type="button"
        className={`${styles.close} siteBtn`}
        onClick={onClose}
        aria-label="Close"
      >
        X
      </button>

      <div className={styles.overlayLinks}>
        {NAV_LINKS.map((link, index) => (
          <motion.a
            key={link.id}
            href={sectionHref(link.id)}
            className={`${styles.sheetLink} siteBtn`}
            style={{
              backgroundColor: TAB_COLORS[index % TAB_COLORS.length],
              rotate: LABEL_ROTATIONS[index % LABEL_ROTATIONS.length],
            }}
            onClick={() => onNavigate(link.id)}
          >
            {link.label}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

export function NavBar() {
  // Teniamo traccia della linguetta attiva.
  // Inizializziamo con l'id del primo link (es. 'works')
  const [activeId, setActiveId] = useState<string>("logo");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const menuId = useId();

  const logoId = "logo";
  const logoLabel = "Panna";
  const logoIndex = 0;

  // Funzione che gestisce il click
  const handleTabClick = (id: string) => {
    setActiveId(id);

    // Effettua la navigazione verso l'hash (es. scende alla sezione #works)
    const href =
      id === logoId ? sectionHref(SECTION_IDS.intro) : sectionHref(id as SectionId);
    window.location.href = href;
  };

  const closeMenu = () => setMenuOpen(false);

  const handleMobileLink = (id: SectionId) => {
    setActiveId(id);
    closeMenu();
  };

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    const previousOverflow = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.documentElement.style.overflow = previousOverflow.html;
      document.body.style.overflow = previousOverflow.body;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 769px)");
    const onChange = () => {
      if (media.matches) closeMenu();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={`${styles.header} ${menuOpen ? styles.headerOpen : ""}`}>
      <nav aria-label="Primary" className={styles.nav}>
        {/* IL RACCOGLITORE DELLE LINGUETTE — solo desktop */}
        <div className={styles.tagsContainer}>
          <MenuTag
            key={logoId}
            label={logoLabel}
            index={logoIndex}
            total={NAV_LINKS.length}
            isActive={activeId === logoId}
            onClick={() => handleTabClick(logoId)}
            color={"#2488C4"}
            hasTag={false}
          >
            <a
              href={sectionHref(SECTION_IDS.intro)}
              className={styles.logo}
              onClick={() => setActiveId("logo")}
            >
              PANNA
            </a>
          </MenuTag>
          {NAV_LINKS.map((link, index) => (
            <MenuTag
              key={link.id}
              label={link.label}
              index={index + 1}
              total={NAV_LINKS.length}
              isActive={activeId === link.id}
              onClick={() => handleTabClick(link.id)}
              color={TAB_COLORS[index % TAB_COLORS.length]}
              hasTag={true}
            >
              <a
                href={sectionHref(SECTION_IDS.intro)}
                className={styles.logo}
                onClick={() => setActiveId("logo")}
              >
                PANNA
              </a>
            </MenuTag>
          ))}
        </div>

        <div className={styles.mobileBar}>
          <a
            href={sectionHref(SECTION_IDS.intro)}
            className={styles.logo}
            onClick={() => {
              setActiveId("logo");
              closeMenu();
            }}
          >
            PANNA
          </a>
          <button
            type="button"
            className={`${styles.menuTrigger} siteBtn`}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <MobileMenuOverlay
            key="mobile-menu"
            menuId={menuId}
            reduceMotion={Boolean(reduceMotion)}
            onClose={closeMenu}
            onNavigate={handleMobileLink}
          />
        ) : null}
      </AnimatePresence>
    </header>
  );
}