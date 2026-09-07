import { clsx } from 'clsx';

import './skeleton.css';

interface ISkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: ISkeletonProps) => (
  <span aria-hidden className={clsx('skeleton relative block overflow-hidden bg-[color:var(--skeleton)]', className)}>
    <span className="animate-skeleton-sweep absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--skeleton)] to-transparent motion-reduce:animate-none" />
  </span>
);
