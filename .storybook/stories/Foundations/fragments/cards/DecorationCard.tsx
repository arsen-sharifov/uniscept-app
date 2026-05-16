import type { ReactNode } from 'react';

interface IDecorationCardProps {
  label: string;
  children: ReactNode;
}

export const DecorationCard = ({ label, children }: IDecorationCardProps) => (
  <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
    <span className="font-mono text-[10px] tracking-[0.24em] text-[color:var(--text-subtle)] uppercase">{label}</span>
    <div className="mt-2">{children}</div>
  </div>
);
