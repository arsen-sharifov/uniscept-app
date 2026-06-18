import type { ReactNode } from 'react';

import type { TNodeBandTone } from '@interfaces';

import { NODE_BAND_TONES } from '../consts';

interface INodeBandProps {
  tone: TNodeBandTone;
  label: string;
  trailing?: ReactNode;
}

export const NodeBand = ({ tone, label, trailing }: INodeBandProps) => {
  const { icon: Icon, color } = NODE_BAND_TONES[tone];

  return (
    <div
      className="flex items-center gap-1.5 rounded-t-2xl px-3 py-1.5 text-[color:var(--surface-elevated)] select-none"
      style={{ background: `linear-gradient(135deg, ${color}, color-mix(in oklab, ${color}, #000 24%))` }}
    >
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} />
      <span className="flex-1 truncate text-[9px] font-semibold tracking-[0.16em] uppercase">{label}</span>
      {trailing}
    </div>
  );
};
