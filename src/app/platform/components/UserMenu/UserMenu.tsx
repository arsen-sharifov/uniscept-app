'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import type { User } from '@supabase/supabase-js';
import { useTranslations } from '@hooks';
import { getUser, signOut } from '@api/client';
import { getInitials, Popover } from '@/components';
import { clearLocale } from '@/i18n';
import { PREFERENCES_STORAGE_KEY } from '@constants';

export interface IUserMenuProps {
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
        if (!cancelled) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    (user?.user_metadata?.name as string | undefined) || user?.email?.split('@')[0] || translations.common.userAvatar;
  const email = user?.email ?? '';
  const initials = getInitials(displayName, email);

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      localStorage.removeItem(PREFERENCES_STORAGE_KEY);
      await clearLocale();
      router.push('/login');
    }
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
            open ? 'bg-[color:var(--surface-overlay)]' : 'hover:bg-[color:var(--surface-overlay)]'
          )}
        >
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-[10px] font-bold text-[color:var(--on-accent)] shadow-sm">
            {initials}
            <span className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border-2 border-[color:var(--surface)] bg-[color:var(--accent)]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-semibold text-[color:var(--text-strong)]">{displayName}</span>
            <span className="truncate text-[10px] text-[color:var(--text-muted)]">{email}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-subtle)] transition-colors group-hover:text-[color:var(--text)]" />
        </button>
      }
    >
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] px-3 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--accent)] to-[color:var(--accent-2)] text-xs font-bold text-[color:var(--on-accent)] shadow-sm">
          {initials}
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-[color:var(--text-strong)]">{displayName}</span>
          <span className="truncate text-[11px] text-[color:var(--text-muted)]">{email}</span>
        </div>
      </div>
      <div className="space-y-0.5 p-1.5">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            onSettingsClick?.();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[color:var(--text)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
        >
          <Settings className="h-3.5 w-3.5 text-[color:var(--text-muted)]" />
          <span>{translations.platform.settings.title}</span>
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-[color:var(--text)] transition-colors hover:bg-[color:var(--status-error-soft)] hover:text-[color:var(--status-error)]"
        >
          <LogOut className="h-3.5 w-3.5 text-[color:var(--text-muted)] transition-colors group-hover:text-[color:var(--status-error)]" />
          <span>{translations.platform.sidebar.signOut}</span>
        </button>
      </div>
    </Popover>
  );
};
