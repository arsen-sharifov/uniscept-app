import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ITableColumn {
  id: string;
  label: string;
  width?: string;
  align?: 'left' | 'right';
}

interface ITableProps {
  columns: ITableColumn[];
  children: ReactNode;
}

export const Table = ({ columns, children }: ITableProps) => {
  const tpl = columns.map((c) => c.width ?? 'minmax(0, 1fr)').join(' ');

  return (
    <div
      className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]"
      style={{ ['--table-tpl' as string]: tpl }}
    >
      <div
        className="grid items-center gap-x-4 border-b border-[color:var(--border)] bg-[color:var(--surface-soft)] px-4 py-2.5"
        style={{ gridTemplateColumns: tpl }}
      >
        {columns.map((col) => (
          <span
            key={col.id}
            className={clsx(
              'truncate font-mono text-[9.5px] font-semibold tracking-[0.22em] text-[color:var(--text-subtle)] uppercase',
              col.align === 'right' && 'text-right'
            )}
          >
            {col.label}
          </span>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};
