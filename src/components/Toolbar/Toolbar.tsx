'use client';

import { clsx } from 'clsx';
import { HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IToolGroup, IToolItem } from '@interfaces';
import { useTranslations } from '@hooks';
import { buildHelpTool } from '@/components/tools';

import { TOOLTIP_DELAY_MS } from './consts';
import { ShortcutsHelp, ToolButton, ToolTooltip } from './fragments';
import { useToolbarShortcuts } from './hooks';
import { isTypingTarget } from './utils';

interface IToolHoverState {
  tool: IToolItem;
  top: number;
}

const noop = () => {};

export interface IToolbarProps {
  groups?: IToolGroup[];
  activeTool?: string;
  onToolClick?: (id: string) => void;
}

export const Toolbar = ({ groups = [], activeTool, onToolClick }: IToolbarProps) => {
  useToolbarShortcuts();

  const t = useTranslations();
  const toolsTranslations = t.platform.canvas.tools;
  const helpTool = useMemo(() => buildHelpTool(toolsTranslations), [toolsTranslations]);
  const [hover, setHover] = useState<IToolHoverState | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const showTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);
  const helpButtonRef = useRef<HTMLButtonElement>(null);

  const clearShowTimer = useCallback(() => {
    if (showTimerRef.current === null) return;
    window.clearTimeout(showTimerRef.current);
    showTimerRef.current = null;
  }, []);

  useEffect(() => clearShowTimer, [clearShowTimer]);

  const showHover = useCallback(
    (next: IToolHoverState) => {
      clearShowTimer();

      if (visibleRef.current) {
        setHover(next);

        return;
      }

      showTimerRef.current = window.setTimeout(() => {
        visibleRef.current = true;
        setHover(next);
      }, TOOLTIP_DELAY_MS);
    },
    [clearShowTimer],
  );

  const hideHover = useCallback(() => {
    clearShowTimer();
    visibleRef.current = false;
    setHover(null);
  }, [clearShowTimer]);

  const handleToolEnter = useCallback(
    (rect: DOMRect, tool: IToolItem) => {
      showHover({ tool, top: rect.top + rect.height / 2 });
    },
    [showHover],
  );

  const handleHelpEnter = useCallback(() => {
    const rect = helpButtonRef.current?.getBoundingClientRect();
    if (!rect) return;

    showHover({ tool: helpTool, top: rect.top + rect.height / 2 });
  }, [showHover, helpTool]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '?') return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      setHelpOpen((prev) => !prev);
    };

    window.addEventListener('keydown', onKey);

    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <aside
        aria-label={t.platform.canvas.tools.ariaLabel}
        onMouseLeave={hideHover}
        className="fixed top-4 right-4 z-40 flex h-[calc(100vh-2rem)] w-14 flex-col items-stretch rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]/85 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-out select-none"
      >
        <div className="flex flex-1 flex-col items-stretch px-1.5 pt-3">
          {groups.map((group, index) => (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className={clsx(
                'flex flex-col items-stretch gap-0.5 py-1.5',
                index > 0 && 'border-t border-[color:var(--border)]',
              )}
            >
              {group.tools.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  active={tool.id === activeTool}
                  onClick={onToolClick ?? noop}
                  onPointerEnter={handleToolEnter}
                  onPointerLeave={hideHover}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-center border-t border-[color:var(--border)] px-1.5 py-2">
          <button
            ref={helpButtonRef}
            type="button"
            onClick={() => setHelpOpen(true)}
            onPointerEnter={handleHelpEnter}
            onPointerLeave={hideHover}
            onFocus={handleHelpEnter}
            onBlur={hideHover}
            aria-label={t.platform.canvas.shortcuts.ariaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[color:var(--text-muted)] transition-[background,color,transform] duration-150 ease-out outline-none hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] active:scale-[0.94] motion-reduce:transition-none"
          >
            <HelpCircle className="h-[15px] w-[15px]" strokeWidth={1.85} />
          </button>
        </div>
      </aside>

      <ToolTooltip tool={hover?.tool ?? null} top={hover?.top ?? -1000} visible={Boolean(hover)} />

      <ShortcutsHelp open={helpOpen} groups={groups} activeTool={activeTool} onClose={() => setHelpOpen(false)} />
    </>
  );
};
