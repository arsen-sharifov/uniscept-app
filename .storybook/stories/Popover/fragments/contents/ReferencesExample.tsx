import { ArrowUpRight } from 'lucide-react';

import { SAMPLE_REFERENCES } from '../../consts';

interface IReferencesExampleProps {
  onSelect?: (label: string) => void;
}

export const ReferencesExample = ({ onSelect }: IReferencesExampleProps = {}) => (
  <div className="w-72 p-2">
    <div className="px-2 pb-2 font-mono text-[9.5px] tracking-[0.24em] text-[color:var(--text-subtle)] uppercase">
      Cross-canvas references
    </div>
    <ul className="space-y-0.5 text-[12.5px]">
      {SAMPLE_REFERENCES.map((label) => (
        <li key={label}>
          <button
            type="button"
            onClick={() => onSelect?.(label)}
            className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
          >
            <span className="truncate">{label}</span>
            <ArrowUpRight className="h-3 w-3 shrink-0 text-[color:var(--text-faint)]" strokeWidth={2} />
          </button>
        </li>
      ))}
    </ul>
  </div>
);
