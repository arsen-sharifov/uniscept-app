import type { ReactNode } from 'react';

interface ISampleCardProps {
  title: string;
  children: ReactNode;
}

export const SampleCard = ({ title, children }: ISampleCardProps) => (
  <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
    <span className="font-mono text-[10px] tracking-[0.22em] text-[color:var(--text-subtle)] uppercase">{title}</span>
    <div>{children}</div>
  </div>
);
