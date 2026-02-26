import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { TNavItem } from '@interfaces';
import { List } from '@/components';
import { MAX_DEPTH } from './consts';

export interface INavItemsProps {
  items: TNavItem[];
  depth?: number;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  onCreateTopic?: (folderId?: string) => void;
}

export const NavItems = ({
  items,
  depth = 0,
  activeItemId,
  onItemClick,
  onDeleteItem,
  onCreateTopic,
}: INavItemsProps) => (
  <div className="space-y-0.5 overflow-hidden">
    {items.map((item) => {
      const isActive = item.id === activeItemId;

      if (item.type === 'folder' && depth < MAX_DEPTH) {
        return (
          <List
            key={item.id}
            trigger={(open, toggle) => (
              <div className="group/item relative flex min-w-0 items-center">
                <button
                  onClick={toggle}
                  className={clsx(
                    'flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-sm transition-all group-hover/item:pr-12',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-white shadow-sm'
                      : 'text-black/60 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 hover:text-emerald-700'
                  )}
                >
                  <ChevronRight
                    className={clsx(
                      'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                      open && 'rotate-90'
                    )}
                  />
                  {open ? (
                    <FolderOpen
                      className={clsx(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-white' : 'text-emerald-500'
                      )}
                    />
                  ) : (
                    <Folder
                      className={clsx(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-white' : 'text-black/30'
                      )}
                    />
                  )}
                  <span className="truncate">{item.name}</span>
                </button>
                <div
                  className="absolute right-1 hidden items-center gap-0.5 group-hover/item:flex"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onCreateTopic?.(item.id)}
                    className={clsx(
                      'rounded-lg p-1',
                      isActive
                        ? 'text-white/60 hover:bg-white/20 hover:text-white'
                        : 'text-black/30 hover:bg-black/5 hover:text-black/60'
                    )}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onDeleteItem?.(item.id)}
                    className={clsx(
                      'rounded-lg p-1',
                      isActive
                        ? 'text-white/60 hover:bg-white/20 hover:text-white'
                        : 'text-black/30 hover:bg-black/5 hover:text-black/60'
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          >
            <div className="mt-0.5 ml-3 space-y-0.5 border-l border-black/5 pl-2">
              <NavItems
                items={item.items}
                depth={depth + 1}
                activeItemId={activeItemId}
                onItemClick={onItemClick}
                onDeleteItem={onDeleteItem}
                onCreateTopic={onCreateTopic}
              />
            </div>
          </List>
        );
      }

      return (
        <div
          key={item.id}
          className="group/item relative flex min-w-0 items-center"
        >
          <button
            onClick={() => onItemClick?.(item.id)}
            className={clsx(
              'flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-1 text-sm transition-all group-hover/item:pr-8',
              isActive
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 font-medium text-white shadow-sm'
                : 'text-black/60 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-cyan-500/10 hover:text-emerald-700'
            )}
          >
            <div className="h-3.5 w-3.5 shrink-0" />
            {item.type === 'folder' ? (
              <Folder
                className={clsx(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-white' : 'text-black/30'
                )}
              />
            ) : (
              <FileText
                className={clsx(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-white' : 'text-black/25'
                )}
              />
            )}
            <span className="truncate">{item.name}</span>
          </button>
          <div
            className="absolute right-1 hidden items-center gap-0.5 group-hover/item:flex"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onDeleteItem?.(item.id)}
              className={clsx(
                'rounded-lg p-1',
                isActive
                  ? 'text-white/60 hover:bg-white/20 hover:text-white'
                  : 'text-black/30 hover:bg-black/5 hover:text-black/60'
              )}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    })}
  </div>
);
