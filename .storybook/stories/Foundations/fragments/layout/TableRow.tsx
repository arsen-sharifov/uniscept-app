import type { ReactNode } from 'react';

export const TableRow = ({ children }: { children: ReactNode }) => (
  <div
    className="grid items-center gap-x-4 border-b border-[color:var(--border)] px-4 py-3 last:border-b-0 hover:bg-[color:var(--surface-soft)]"
    style={{ gridTemplateColumns: 'var(--table-tpl)' }}
  >
    {children}
  </div>
);
