'use client';

import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Settings,
  User,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Logo } from '@/components/branding';
import { List } from '@/components/List';

export type TopicItem = {
  type: 'topic';
  id: string;
  name: string;
};

export type FolderItem = {
  type: 'folder';
  id: string;
  name: string;
  items: NavItem[];
};

export type NavItem = TopicItem | FolderItem;

export type SidebarProps = {
  items?: NavItem[];
  workspaceName?: string;
};

const NavItems = ({ items }: { items: NavItem[] }) => (
  <div className="space-y-0.5">
    {items.map((item) => {
      if (item.type === 'folder') {
        return (
          <List
            key={item.id}
            trigger={(open, toggle) => (
              <button
                onClick={toggle}
                className="flex w-full items-center gap-2 rounded-xl px-2 py-1 text-sm text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              >
                <ChevronRight
                  className={clsx(
                    'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                    open && 'rotate-90'
                  )}
                />
                {open ? (
                  <FolderOpen className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0 text-black/30" />
                )}
                <span className="truncate">{item.name}</span>
              </button>
            )}
          >
            <div className="mt-0.5 ml-[22px] space-y-0.5 border-l border-black/5 pl-2">
              <NavItems items={item.items} />
            </div>
          </List>
        );
      }

      return (
        <button
          key={item.id}
          className="flex w-full items-center gap-2 rounded-xl px-2 py-1 text-sm text-black/60 transition-colors hover:bg-black/5 hover:text-black"
        >
          <div className="h-3.5 w-3.5 shrink-0" />
          <FileText className="h-4 w-4 shrink-0 text-black/25" />
          <span className="truncate">{item.name}</span>
        </button>
      );
    })}
  </div>
);

export const Sidebar = ({
  items = [],
  workspaceName = 'My Workspace',
}: SidebarProps) => {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <aside className="fixed top-4 left-4 z-40 flex h-[calc(100vh-2rem)] w-60 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-lg backdrop-blur-xl">
      <div className="flex items-center border-b border-black/5 px-4 py-3">
        <Logo className="text-xl" />
      </div>

      <div className="border-b border-black/5 px-3 py-2">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-black/5"
        >
          <span className="truncate">{workspaceName}</span>
          <ChevronDown
            className={clsx(
              'h-4 w-4 shrink-0 text-black/40 transition-transform duration-200',
              workspaceOpen && 'rotate-180'
            )}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-1.5 flex items-center justify-between px-2">
          <span className="text-xs font-medium tracking-wider text-black/30 uppercase">
            Structure
          </span>
          <button className="rounded-lg p-1 transition-colors hover:bg-black/5">
            <Plus className="h-3.5 w-3.5 text-black/30" />
          </button>
        </div>

        <NavItems items={items} />
      </div>

      <div className="space-y-0.5 border-t border-black/5 px-3 py-2">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm text-black/50 transition-colors hover:bg-black/5 hover:text-black">
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-sm text-black/50 transition-colors hover:bg-black/5 hover:text-black">
          <User className="h-4 w-4 shrink-0" />
          <span>Account</span>
        </button>
      </div>
    </aside>
  );
};
