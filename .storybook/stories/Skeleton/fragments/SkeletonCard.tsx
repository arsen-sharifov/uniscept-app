import { Skeleton } from '@/components';

export const SkeletonCard = () => (
  <div className="flex w-72 flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-24" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
    <Skeleton className="mt-1 h-8 w-28 rounded-lg" />
  </div>
);
