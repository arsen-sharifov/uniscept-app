import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { clsx } from 'clsx';

export interface ITooltipProps {
  text: string;
  children?: ReactNode;
  position?: 'top' | 'bottom';
}

export const Tooltip = ({
  text,
  children,
  position = 'top',
}: ITooltipProps) => {
  const isTop = position === 'top';

  return (
    <div className="group relative">
      {children ?? <Info className="h-3.5 w-3.5 cursor-help text-black/30" />}
      <div
        className={clsx(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100',
          isTop ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        )}
      >
        <div className="w-48">{text}</div>
        <div
          className={clsx(
            'absolute left-1/2 -translate-x-1/2 border-4 border-transparent',
            isTop ? 'top-full border-t-black' : 'bottom-full border-b-black'
          )}
        />
      </div>
    </div>
  );
};
