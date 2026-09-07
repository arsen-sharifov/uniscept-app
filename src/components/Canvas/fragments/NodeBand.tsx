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
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-[11px] [transition-delay:inherit]"
      >
        <span
          className="absolute inset-x-0 top-0 block h-[3px] transition-colors [transition-delay:inherit] duration-300 motion-reduce:transition-none"
          style={{ backgroundColor: color }}
        />
      </span>
      <div
        className="flex items-center gap-1.5 transition-colors [transition-delay:inherit] duration-300 select-none motion-reduce:transition-none"
        style={{ color }}
      >
        <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} />
        <span className="min-w-0 flex-1 truncate font-mono-ui text-[9px] font-bold tracking-[0.16em] uppercase">
          {label}
        </span>
        {trailing}
      </div>
    </>
  );
};
