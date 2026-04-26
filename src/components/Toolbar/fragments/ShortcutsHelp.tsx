'use client';

import { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import type { IToolGroup } from '@interfaces';

interface IShortcutsHelpProps {
  open: boolean;
  groups: IToolGroup[];
  activeTool?: string;
  onClose: () => void;
}

const renderShortcut = (shortcut: string) => {
  const tokens: string[] = [];
  let buffer = '';
  for (const char of shortcut) {
    if (char === '⌘' || char === '⇧' || char === '⌥' || char === '⌃') {
      if (buffer) {
        tokens.push(buffer);
        buffer = '';
      }
      tokens.push(char);
    } else {
      buffer += char;
    }
  }
  if (buffer) tokens.push(buffer);
  return tokens;
};

export const ShortcutsHelp = ({
  open,
  groups,
  activeTool,
  onClose,
}: IShortcutsHelpProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-label="Keyboard shortcuts"
        onClick={(event) => event.stopPropagation()}
        className={clsx(
          'relative w-full max-w-[640px] overflow-hidden rounded-[20px]',
          'border border-black/[0.06] bg-white/95 backdrop-blur-xl',
          'shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset,0_30px_80px_-20px_rgba(15,23,42,0.4)]',
          'animate-[shortcuts-rise_180ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none'
        )}
      >
        <style>{`
          @keyframes shortcuts-rise {
            from { opacity: 0; transform: translateY(8px) scale(0.985); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div className="flex items-center justify-between border-b border-black/[0.05] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700">
              <Keyboard className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold tracking-tight text-neutral-900">
                Keyboard shortcuts
              </span>
              <span className="text-[10.5px] tracking-[0.04em] text-neutral-500">
                Press a key to switch tools instantly.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-black/[0.05] hover:text-neutral-800"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid max-h-[64vh] grid-cols-1 gap-x-6 overflow-y-auto px-5 py-4 sm:grid-cols-2">
          {groups.map((group) => (
            <section key={group.id} className="mb-4 break-inside-avoid">
              {group.label && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9.5px] font-semibold tracking-[0.18em] text-neutral-400 uppercase">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-black/[0.08] to-transparent" />
                </div>
              )}
              <ul className="space-y-1">
                {group.tools.map((tool) => {
                  const isActive = tool.id === activeTool;
                  const Icon = tool.icon;

                  return (
                    <li
                      key={tool.id}
                      className={clsx(
                        'group/row flex items-start gap-3 rounded-lg px-2 py-1.5 transition-colors',
                        isActive && 'bg-emerald-500/[0.06]',
                        tool.disabled && 'opacity-45'
                      )}
                    >
                      <span
                        className={clsx(
                          'mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                          isActive
                            ? 'bg-emerald-500 text-white shadow-[0_2px_6px_-2px_rgba(16,185,129,0.6)]'
                            : 'bg-neutral-100 text-neutral-600'
                        )}
                      >
                        <Icon
                          className="h-[14px] w-[14px]"
                          strokeWidth={isActive ? 2.25 : 1.85}
                        />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              'truncate text-[12.5px] font-medium tracking-tight',
                              isActive ? 'text-emerald-800' : 'text-neutral-900'
                            )}
                          >
                            {tool.label}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-1.5 py-px text-[9px] font-semibold tracking-[0.08em] text-emerald-700 uppercase">
                              <span className="h-1 w-1 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          )}
                        </div>
                        {tool.description && (
                          <span className="mt-0.5 text-[11px] leading-snug text-neutral-500">
                            {tool.description}
                          </span>
                        )}
                      </div>

                      {tool.shortcut && (
                        <div className="mt-px flex shrink-0 items-center gap-0.5">
                          {renderShortcut(tool.shortcut).map((token, i) => (
                            <kbd
                              key={i}
                              className={clsx(
                                'flex h-5 min-w-[20px] items-center justify-center rounded-[5px] border px-1 font-mono text-[10px] font-medium',
                                isActive
                                  ? 'border-emerald-500/25 bg-white text-emerald-800'
                                  : 'border-black/[0.08] bg-neutral-50 text-neutral-700'
                              )}
                            >
                              {token}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/[0.05] bg-neutral-50/60 px-5 py-2.5">
          <span className="text-[10.5px] text-neutral-500">
            Shortcuts work even while this panel is open.
          </span>
          <span className="text-[10.5px] font-medium text-neutral-500">
            <kbd className="mr-1 rounded border border-black/[0.08] bg-white px-1 font-mono text-[10px] text-neutral-700">
              Esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
