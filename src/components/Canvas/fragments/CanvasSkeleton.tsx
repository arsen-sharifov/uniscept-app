import { Skeleton } from '@/components/Skeleton';

import { CANVAS_SKELETON_NODES } from '../consts';

export const CanvasSkeleton = () => (
  <div aria-hidden className="absolute inset-0 z-20 overflow-hidden bg-[color:var(--app-bg)]">
    {CANVAS_SKELETON_NODES.map(({ id, x, y, width, lines }) => (
      <div
        key={id}
        style={{ left: `${x}%`, top: `${y}%`, width }}
        className="absolute flex -translate-x-1/2 flex-col gap-1.5 overflow-hidden rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 py-3 shadow-[var(--shadow-pip)]"
      >
        <span aria-hidden className="absolute inset-x-0 top-0 block h-[3px] bg-[color:var(--skeleton)]" />
        <Skeleton className="h-2.5 w-20 rounded-sm" />
        {Array.from({ length: lines }, (_, line) => (
          <Skeleton key={line} className={line === lines - 1 ? 'h-3 w-2/3' : 'h-3 w-full'} />
        ))}
      </div>
    ))}
  </div>
);
