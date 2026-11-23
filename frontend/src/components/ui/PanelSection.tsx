import type { ReactNode } from "react";

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function PanelSection({ title, children, className = "" }: PanelSectionProps) {
  return (
    <section className={`border-b border-line px-4 py-4 ${className}`}>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-subtle">{title}</h2>
      {children}
    </section>
  );
}
