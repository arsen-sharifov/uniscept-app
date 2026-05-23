'use client';

import { useEffect, useRef, useState } from 'react';

import { findThemeAncestor } from '../../utils';
import { Copyable } from '../widgets';

interface IColorChipProps {
  variable: string;
  label: string;
  role: string;
}

export const ColorChip = ({ variable, label, role }: IColorChipProps) => {
  const swatchRef = useRef<HTMLSpanElement>(null);
  const [resolved, setResolved] = useState('—');

  useEffect(() => {
    const swatch = swatchRef.current;
    if (!swatch) return;

    const measure = () => {
      const computed = getComputedStyle(swatch).backgroundColor;
      setResolved(computed || '—');
    };

    measure();

    const ancestor = findThemeAncestor(swatch.parentElement);
    if (!ancestor) return;

    const observer = new MutationObserver(measure);
    observer.observe(ancestor, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, [variable]);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] transition-colors hover:border-[color:var(--border-strong)]">
      <div
        aria-hidden
        className="relative h-20 w-full"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgba(0,0,0,0.045) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.045) 75%), linear-gradient(45deg, rgba(0,0,0,0.045) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.045) 75%)',
          backgroundSize: '10px 10px',
          backgroundPosition: '0 0, 5px 5px',
        }}
      >
        <span ref={swatchRef} className="absolute inset-0" style={{ backgroundColor: `var(${variable})` }} />
      </div>
      <div className="space-y-1.5 px-3 py-2.5">
        <span className="block truncate text-[12.5px] font-medium tracking-tight text-[color:var(--text-strong)]">
          {label}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <Copyable value={variable} />
          <Copyable value={resolved} display={resolved} />
        </div>
        <span className="block text-[10.5px] leading-snug text-[color:var(--text-muted)]">{role}</span>
      </div>
    </div>
  );
};
