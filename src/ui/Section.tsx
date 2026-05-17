import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border/70 bg-gradient-to-b from-surface-panel to-surface-elevated p-3 shadow-sm">
      <h2 className="text-[11px] font-semibold uppercase tracking-widest text-text-secondary/80">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
