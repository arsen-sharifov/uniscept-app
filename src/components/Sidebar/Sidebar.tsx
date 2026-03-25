'use client';

import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LogOut,
  Plus,
  Settings as SettingsIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { TNavItem, IWorkspaceItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { signOut } from '@api/client';
import { Logo, List } from '@/components';
import { NavItems } from './NavItems';

export interface ISidebarProps {
  items?: TNavItem[];
  workspaces?: IWorkspaceItem[];
  activeWorkspaceId?: string;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onCreateTopic?: (folderId?: string) => void;
  onWorkspaceSelect?: (id: string) => void;
  onCreateWorkspace?: () => void;
  onSettingsClick?: () => void;
}

export const Sidebar = ({
  items = [],
  workspaces = [],
  activeWorkspaceId,
  activeItemId,
  onItemClick,
  onDeleteItem,
  onCreateTopic,
  onWorkspaceSelect,
  onCreateWorkspace,
  onSettingsClick,
}: ISidebarProps) => {
  const router = useRouter();
  const t = useTranslations();

  const activeWorkspaceName =
    workspaces.find((w) => w.id === activeWorkspaceId)?.name ??
    t.platform.sidebar.defaultWorkspace;

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <aside className="fixed top-4 left-4 z-40 flex h-[calc(100vh-2rem)] w-60 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-start border-b border-black/5 px-6 py-3">
        <Logo className="text-xl" />
      </div>

      <div className="border-b border-black/5 px-3 py-2">
        <List
          trigger={(open, toggle) => (
            <button
              onClick={toggle}
              className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-black/5"
            >
              <span className="truncate">{activeWorkspaceName}</span>
              <ChevronDown
                className={clsx(
                  'h-4 w-4 shrink-0 text-black/40 transition-transform duration-200',
                  open && 'rotate-180'
                )}
              />
            </button>
          )}
        >
          <div className="mt-1 space-y-0.5 pb-1">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => onWorkspaceSelect?.(ws.id)}
                className={clsx(
                  'flex w-full items-center rounded-xl px-3 py-1.5 text-sm transition-all',
                  ws.id === activeWorkspaceId
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-white shadow-sm'
                    : 'text-black/60 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 hover:text-emerald-700'
                )}
              >
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
            <button
              onClick={onCreateWorkspace}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-sm text-black/40 transition-colors hover:bg-black/5 hover:text-black/60"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>{t.platform.sidebar.newWorkspace}</span>
            </button>
          </div>
        </List>
      </div>

      <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between px-2">
          <span className="text-xs font-medium tracking-wider text-black/30 uppercase">
            {t.platform.sidebar.structure}
          </span>
          <button
            onClick={() => onCreateTopic?.()}
            className="rounded-lg p-1 transition-colors hover:bg-black/5"
          >
            <Plus className="h-3.5 w-3.5 text-black/30" />
          </button>
        </div>

        <NavItems
          items={items}
          activeItemId={activeItemId}
          onItemClick={onItemClick}
          onDeleteItem={onDeleteItem}
          onCreateTopic={onCreateTopic}
        />
      </div>

      <div className="space-y-0.5 border-t border-black/5 px-3 py-2">
        <button
          onClick={onSettingsClick}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-1.5 text-sm text-black/50 transition-colors hover:bg-black/5 hover:text-black"
        >
          <SettingsIcon className="h-4 w-4 shrink-0" />
          <span>{t.platform.settings.title}</span>
        </button>
        <button
          onClick={handleSignOut}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-1.5 text-sm text-black/50 transition-colors hover:bg-black/5 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>{t.platform.sidebar.signOut}</span>
        </button>
      </div>
    </aside>
  );
};
