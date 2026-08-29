import { NAV_LINKS, SECTION_IDS, sectionHref } from "@/lib/navigation";

export function NavBar() {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="flex h-16 items-center justify-between px-6 md:px-10"
      >
        <a
          href={sectionHref(SECTION_IDS.intro)}
          className="font-sans text-lg font-semibold tracking-tight"
        >
          Panna
        </a>
        <ul className="flex items-center gap-5 text-sm md:gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={sectionHref(link.id)}
                className="text-foreground/80 transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
