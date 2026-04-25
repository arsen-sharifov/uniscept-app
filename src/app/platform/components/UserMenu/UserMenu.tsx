'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import type { User } from '@supabase/supabase-js';
import { useTranslations } from '@hooks';
import { getUser, signOut } from '@api/client';
import { getInitials, Popover } from '@/components';

interface IUserMenuProps {
  onSettingsClick?: () => void;
}

export const UserMenu = ({ onSettingsClick }: IUserMenuProps) => {
  const router = useRouter();
  const translations = useTranslations();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUser()
      .then(({ data }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'User';
  const email = user?.email ?? '';
  const initials = getInitials(displayName, email);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement="top-start"
      offset={6}
      panelClassName="w-[var(--ws-popover-w,15rem)]"
      trigger={
        <button
          type="button"
          className={clsx(
            'group flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors',
            open
              ? 'bg-black/[0.04]'
              : 'hover:bg-black/[0.03] active:bg-black/[0.05]'
          )}
        >
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-[10px] font-bold text-white shadow-sm">
            {initials}
            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-semibold text-black/80">
              {displayName}
            </span>
            <span className="truncate text-[10px] text-black/40">{email}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-black/30 transition-colors group-hover:text-black/60" />
        </button>
      }
    >
      <div className="flex items-center gap-3 border-b border-black/5 px-3 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white shadow-sm">
          {initials}
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-black/85">
            {displayName}
          </span>
          <span className="truncate text-[11px] text-black/45">{email}</span>
        </div>
      </div>
      <div className="space-y-0.5 p-1.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSettingsClick?.();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-black/65 transition-colors hover:bg-black/[0.04] hover:text-black/85"
        >
          <Settings className="h-3.5 w-3.5 text-black/40" />
          <span>{translations.platform.settings.title}</span>
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-black/65 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5 text-black/40 transition-colors group-hover:text-red-500" />
          <span>{translations.platform.sidebar.signOut}</span>
        </button>
      </div>
    </Popover>
  );
};
