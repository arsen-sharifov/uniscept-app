import { clsx } from 'clsx';

import type { ITypeRow } from '@story-interfaces';

import { Copyable } from '../widgets';
import { FamilyChip } from './FamilyChip';

interface IVoiceCardProps {
  family: ITypeRow['family'];
  label: string;
  sample: string;
  sampleClass: string;
  classes: string;
  note: string;
}

export const VoiceCard = ({ family, label, sample, sampleClass, classes, note }: IVoiceCardProps) => (
  <article className="space-y-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
    <div className="flex items-baseline justify-between">
      <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[color:var(--text-subtle)] uppercase">
        {label}
      </span>
      <FamilyChip family={family} />
    </div>
    <p className={clsx(sampleClass, 'text-[color:var(--text-strong)]')}>{sample}</p>
    <p className="text-[11.5px] leading-snug text-[color:var(--text-muted)]">{note}</p>
    <Copyable value={classes} />
  </article>
);
