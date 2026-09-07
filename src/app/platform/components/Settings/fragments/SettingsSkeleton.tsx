import type { TSettingsSection } from '@interfaces';

import { Skeleton } from '@/components';

import {
  SETTINGS_SKELETON_AVATAR_TILES,
  SETTINGS_SKELETON_BADGE_DOTS,
  SETTINGS_SKELETON_BADGE_TILES,
  SETTINGS_SKELETON_PLAN_CARDS,
} from '../consts';
import { SkeletonTileGrid } from './SkeletonTileGrid';

interface ISettingsSkeletonProps {
  section: TSettingsSection;
}

export const SettingsSkeleton = ({ section }: ISettingsSkeletonProps) => {
  if (section === 'plan') {
    return (
      <div aria-hidden className="space-y-4">
        <Skeleton className="h-2.5 w-28" />
        <Skeleton className="h-3 w-96 max-w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: SETTINGS_SKELETON_PLAN_CARDS }, (_, plan) => (
            <Skeleton key={plan} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden className="space-y-4">
      <section className="flex items-center gap-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-5 py-2.5">
        <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-2.5 w-56" />
        </div>
        <div className="hidden shrink-0 gap-1.5 sm:flex">
          {Array.from({ length: SETTINGS_SKELETON_BADGE_DOTS }, (_, badge) => (
            <Skeleton key={badge} className="h-6 w-6 rounded-full" />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-[38px] w-full rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-[38px] w-full rounded-lg" />
        </div>
      </section>

      <SkeletonTileGrid labelWidth="w-16" count={SETTINGS_SKELETON_AVATAR_TILES} />
      <SkeletonTileGrid labelWidth="w-14" count={SETTINGS_SKELETON_BADGE_TILES} />
    </div>
  );
};
