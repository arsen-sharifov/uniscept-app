import { clsx } from 'clsx';

import { Skeleton } from '@/components/Skeleton';

import { SKELETON_ROW_WIDTHS } from '../../consts';

export const SidebarSkeleton = () => (
  <>
    <div className="px-2">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
        <Skeleton className="h-3.5 w-28" />
      </div>
    </div>

    <div className="px-3 pt-2">
      <Skeleton className="h-[34px] w-full rounded-lg" />
    </div>

    <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
      <div className="mb-1 flex h-5 items-center px-2">
        <Skeleton className="h-2.5 w-16" />
      </div>

      {SKELETON_ROW_WIDTHS.map((width) => (
        <div key={width} className="flex min-h-8 items-center gap-2 px-2 py-1.5">
          <Skeleton className="h-4 w-4 shrink-0 rounded" />
          <Skeleton className={clsx('h-3', width)} />
        </div>
      ))}
    </div>
  </>
);
