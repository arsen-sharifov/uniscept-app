'use client';

import { clsx } from 'clsx';
import type { IToolItem } from '@interfaces';

export interface IToolbarProps {
  groups?: IToolItem[][];
  activeTool?: string;
  onToolClick?: (id: string) => void;
}

export const Toolbar = ({
  groups = [],
  activeTool,
  onToolClick,
}: IToolbarProps) => {
  return (
    <aside className="fixed top-4 right-4 z-40 flex h-[calc(100vh-2rem)] w-12 flex-col items-center gap-1 rounded-2xl border border-black/5 bg-white/80 py-3 shadow-lg backdrop-blur-xl">
      {groups.map((group, gi) => (
        <div key={gi} className="flex w-full flex-col items-center gap-1">
          {gi > 0 && <div className="my-1 w-6 border-t border-black/10" />}
          {group.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                onClick={() => onToolClick?.(tool.id)}
                title={tool.label}
                disabled={tool.disabled}
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                  tool.disabled
                    ? 'cursor-not-allowed text-black/20'
                    : isActive
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-sm'
                      : 'text-black/40 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-cyan-500/10 hover:text-emerald-700'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
};
