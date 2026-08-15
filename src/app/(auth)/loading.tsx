import { Skeleton } from '@/components/Skeleton';

const AuthLoading = () => (
  <div className="w-full">
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-3.5 w-36" />
    </div>

    <div className="mt-7 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-2.5 w-14" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <Skeleton className="mt-1 h-10 w-full rounded-lg" />
    </div>

    <Skeleton className="mx-auto mt-6 h-3.5 w-48" />
  </div>
);

export default AuthLoading;
