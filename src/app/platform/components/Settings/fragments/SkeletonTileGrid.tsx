import { clsx } from 'clsx';

import { Skeleton } from '@/components';

interface ISkeletonTileGridProps {
  labelWidth: string;
  count: number;
}

export const SkeletonTileGrid = ({ labelWidth, count }: ISkeletonTileGridProps) => (
  <section className="space-y-2">
    <Skeleton className={clsx('h-2.5', labelWidth)} />
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {Array.from({ length: count }, (_, tile) => (
        <Skeleton key={tile} className="h-[68px] rounded-xl" />
      ))}
    </div>
  </section>
);
