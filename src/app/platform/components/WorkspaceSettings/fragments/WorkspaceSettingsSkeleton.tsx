import { clsx } from 'clsx';

import type { TWorkspaceSettingsSection } from '@interfaces';

import { Skeleton } from '@/components';

import { WORKSPACE_SKELETON_META_ROWS, WORKSPACE_SKELETON_PEOPLE, WORKSPACE_SKELETON_ROLES } from '../consts';

interface IWorkspaceSettingsSkeletonProps {
  section: TWorkspaceSettingsSection;
}

export const WorkspaceSettingsSkeleton = ({ section }: IWorkspaceSettingsSkeletonProps) => {
  if (section === 'general') {
    return (
      <div aria-hidden className="space-y-4">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="h-[38px] w-full rounded-lg" />
        </div>
        <div className="divide-y divide-[color:var(--border)] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]">
          {WORKSPACE_SKELETON_META_ROWS.map((width) => (
            <div key={width} className="flex items-center justify-between px-3 py-2.5">
              <Skeleton className="h-2.5 w-24" />
              <Skeleton className={clsx('h-3', width)} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'roles') {
    return (
      <div aria-hidden className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-[30px] w-28 shrink-0 rounded-lg" />
        </div>
        <div className="space-y-3">
          {WORKSPACE_SKELETON_ROLES.map((width) => (
            <div
              key={width}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-3 py-3"
            >
              <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className={clsx('h-3', width)} />
                <Skeleton className="h-2 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden className="space-y-4">
      <Skeleton className="h-3 w-2/3" />
      <div className="divide-y divide-[color:var(--border)] overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]">
        {WORKSPACE_SKELETON_PEOPLE.map((width) => (
          <div key={width} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className={clsx('h-3', width)} />
              <Skeleton className="h-2 w-40" />
            </div>
            <Skeleton className="h-[30px] w-32 shrink-0 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-[color:var(--border)] pt-4">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-3 w-64 max-w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-[38px] min-w-0 flex-1 rounded-lg" />
          <Skeleton className="h-[38px] w-36 shrink-0 rounded-lg" />
          <Skeleton className="h-[38px] w-28 shrink-0 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
