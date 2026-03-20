import type { ReactNode } from 'react';
import { Info } from 'lucide-react';

export interface ITooltipProps {
  text: string;
  children?: ReactNode;
}

export const Tooltip = ({ text, children }: ITooltipProps) => {
  return (
    <div className="group relative">
      {children ?? <Info className="h-3.5 w-3.5 cursor-help text-black/30" />}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 rounded-lg bg-black px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
        <div className="w-48">{text}</div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black" />
      </div>
    </div>
  );
};
