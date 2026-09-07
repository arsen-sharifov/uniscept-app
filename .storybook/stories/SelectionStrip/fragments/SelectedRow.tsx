import { FileText } from 'lucide-react';

import { SelectionStrip } from '@/components';

interface ISelectedRowProps {
  className?: string;
}

export const SelectedRow = ({ className }: ISelectedRowProps) => (
  <div className="w-64 space-y-0.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-1.5">
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-grotesk text-sm text-[color:var(--text)]">
      <FileText aria-hidden className="h-4 w-4 shrink-0 text-[color:var(--text-muted)]" />
      <span className="truncate">Market analysis</span>
    </div>
    <div className="relative flex items-center gap-2 rounded-lg bg-[color:var(--accent-soft)] px-2 py-1.5 font-grotesk text-sm font-medium text-[color:var(--accent-text)]">
      <SelectionStrip className={className} />
      <FileText aria-hidden className="h-4 w-4 shrink-0" />
      <span className="truncate">Runway decision</span>
    </div>
    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 font-grotesk text-sm text-[color:var(--text)]">
      <FileText aria-hidden className="h-4 w-4 shrink-0 text-[color:var(--text-muted)]" />
      <span className="truncate">Hiring plan</span>
    </div>
  </div>
);
