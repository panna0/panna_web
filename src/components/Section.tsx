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
      className={`flex h-svh w-full flex-col items-center justify-center px-6 ${className}`.trim()}
    >
      {children}
    </section>
  );
}
