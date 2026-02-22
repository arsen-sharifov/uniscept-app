'use client';

import type { LucideIcon } from 'lucide-react';

export type ToolItem = {
  icon: LucideIcon;
};

export type ToolbarProps = {
  groups?: ToolItem[][];
};

export const Toolbar = ({ groups = [] }: ToolbarProps) => {
  return (
    <aside className="fixed top-4 right-4 z-40 flex h-[calc(100vh-2rem)] w-12 flex-col items-center gap-1 rounded-2xl border border-black/5 bg-white/80 py-3 shadow-lg backdrop-blur-xl">
      {groups.map((group, gi) => (
        <div key={gi} className="flex w-full flex-col items-center gap-1">
          {gi > 0 && <div className="my-1 w-6 border-t border-black/10" />}
          {group.map(({ icon: Icon }, i) => (
            <button
              key={i}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-black/40 transition-colors hover:bg-black/5 hover:text-black"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
};
