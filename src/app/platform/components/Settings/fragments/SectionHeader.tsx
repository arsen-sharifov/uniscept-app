import { clsx } from 'clsx';

interface ISectionHeaderProps {
  title: string;
  caption: string;
  danger?: boolean;
  className?: string;
}

export const SectionHeader = ({ title, caption, danger = false, className }: ISectionHeaderProps) => (
  <header className={clsx('flex items-baseline justify-between', className)}>
    <h3
      className={clsx(
        'font-mono-ui text-[10px] font-bold tracking-[0.14em] uppercase',
        danger ? 'text-[color:var(--status-error)]' : 'text-[color:var(--text-label)]',
      )}
    >
      {title}
    </h3>
    <span
      className={clsx(
        'font-mono-ui text-[10px] tracking-[0.14em] uppercase',
        danger ? 'text-[color:var(--status-error)]' : 'text-[color:var(--text-label)]',
      )}
    >
      {caption}
    </span>
  </header>
);
