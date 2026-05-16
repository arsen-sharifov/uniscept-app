import type { ReactNode } from 'react';

interface ISectionProps {
  id: string;
  index: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
  children: ReactNode;
}

export const Section = ({ id, index, title, description, trailing, children }: ISectionProps) => (
  <section id={id} className="scroll-mt-24 space-y-6">
    <header className="flex flex-wrap items-baseline gap-x-5 gap-y-1.5 border-b border-[color:var(--border)] pb-4">
      <span className="font-mono text-[10px] font-semibold tracking-[0.32em] text-[color:var(--text-faint)] uppercase">
        {index}
      </span>
      <h2 className="font-serif text-[26px] leading-[1] tracking-[-0.01em] text-[color:var(--text-strong)] italic">
        {title}
      </h2>
      {description && <p className="text-[12.5px] leading-snug text-[color:var(--text-muted)]">— {description}</p>}
      {trailing && <div className="ml-auto">{trailing}</div>}
    </header>
    {children}
  </section>
);
