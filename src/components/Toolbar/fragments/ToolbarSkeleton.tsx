import { clsx } from 'clsx';

import { Skeleton } from '@/components/Skeleton';

interface IToolbarSkeletonProps {
  groupSizes: number[];
}

export const ToolbarSkeleton = ({ groupSizes }: IToolbarSkeletonProps) => (
  <div aria-hidden className="flex flex-1 flex-col items-stretch px-2 pt-1">
    {groupSizes.map((size, group) => (
      <div
        key={group}
        className={clsx('flex flex-col items-stretch gap-1 py-2', group > 0 && 'border-t border-[color:var(--border)]')}
      >
        {Array.from({ length: size }, (_, tool) => (
          <span key={tool} className="flex h-9 w-9 items-center justify-center self-center">
            <Skeleton className="h-[18px] w-[18px]" />
          </span>
        ))}
      </div>
    ))}
  </div>
);
