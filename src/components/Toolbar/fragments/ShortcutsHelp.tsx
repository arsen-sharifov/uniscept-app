'use client';

import { clsx } from 'clsx';
import { Keyboard, X } from 'lucide-react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

import type { IToolGroup } from '@interfaces';
import { useEscapeKey, useFocusTrap, useTranslations } from '@hooks';

import { renderShortcut } from '../utils';

interface IShortcutsHelpProps {
  open: boolean;
  groups: IToolGroup[];
  activeTool?: string;
  onClose: () => void;
}

export const ShortcutsHelp = ({ open, groups, activeTool, onClose }: IShortcutsHelpProps) => {
  const t = useTranslations();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose, open);
  useFocusTrap(dialogRef, open);

  if (!open || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" onClick={onClose}>
      <div aria-hidden className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.platform.canvas.shortcuts.ariaLabel}
        onClick={(event) => event.stopPropagation()}
        className={clsx(
          'relative w-full max-w-[640px] overflow-hidden rounded-[20px]',
          'border border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur-xl',
          'text-[color:var(--text)] shadow-[var(--shadow-modal)]',
          'animate-rise-up motion-reduce:animate-none',
        )}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent-text)]">
              <Keyboard className="h-3.5 w-3.5" strokeWidth={2} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold tracking-tight text-[color:var(--text-strong)]">
                {t.platform.canvas.shortcuts.title}
              </span>
              <span className="text-[10.5px] tracking-[0.04em] text-[color:var(--text-muted)]">
                {t.platform.canvas.shortcuts.subtitle}
              </span>
            </div>
          </div>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)]"
            aria-label={t.platform.canvas.shortcuts.closeAriaLabel}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid max-h-[64vh] grid-cols-1 gap-x-6 overflow-y-auto px-5 py-4 sm:grid-cols-2">
          {groups.map((group) => (
            <section key={group.id} className="mb-4 break-inside-avoid">
              {group.label && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[9.5px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-[color:var(--border-strong)] to-transparent" />
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
                        isActive && 'bg-[color:var(--accent-soft)]',
                        tool.disabled && 'opacity-45',
                      )}
                    >
                      <span
                        className={clsx(
                          'mt-px flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                          isActive
                            ? 'bg-[color:var(--accent)] text-[color:var(--on-accent)] shadow-[0_2px_6px_-2px_var(--accent-glow)]'
                            : 'bg-[color:var(--surface-overlay)] text-[color:var(--text-muted)]',
                        )}
                      >
                        <Icon className="h-[14px] w-[14px]" strokeWidth={isActive ? 2.25 : 1.85} />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col leading-tight">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={clsx(
                              'truncate text-[12.5px] font-medium tracking-tight',
                              isActive ? 'text-[color:var(--accent-text)]' : 'text-[color:var(--text-strong)]',
                            )}
                          >
                            {tool.label}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--accent-soft)] px-1.5 py-px text-[9px] font-semibold tracking-[0.08em] text-[color:var(--accent-text)] uppercase">
                              <span className="h-1 w-1 rounded-full bg-[color:var(--accent)]" />
                              {t.platform.canvas.shortcuts.activeBadge}
                            </span>
                          )}
                        </div>
                        {tool.description && (
                          <span className="mt-0.5 text-[11px] leading-snug text-[color:var(--text-muted)]">
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
                                  ? 'border-[color:var(--border-active)] bg-[color:var(--surface-elevated)] text-[color:var(--accent-text)]'
                                  : 'border-[color:var(--border)] bg-[color:var(--surface-overlay)] text-[color:var(--text)]',
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

        <div className="flex items-center justify-between gap-3 border-t border-[color:var(--border)] bg-[color:var(--surface-overlay)]/60 px-5 py-2.5">
          <span className="text-[10.5px] text-[color:var(--text-muted)]">{t.platform.canvas.shortcuts.footerHint}</span>
          <span className="text-[10.5px] font-medium text-[color:var(--text-muted)]">
            <kbd className="mr-1 rounded border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-1 font-mono text-[10px] text-[color:var(--text)]">
              Esc
            </kbd>
            {t.platform.canvas.shortcuts.closeHint}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
};
