import type { ReactNode } from "react";
import type { SectionId } from "@/lib/navigation";

type SectionProps = {
  id: SectionId;
  children: ReactNode;
  className?: string;
};

export function Section({ id, children, className = "" }: SectionProps) {
  return (
    <section
      id={id}
      className={`mx-0 h-auto min-h-[100svh] w-full max-w-full px-0 md:h-[130svh] ${className}`.trim()}
    >
      {children}
    </section>
  );
}
