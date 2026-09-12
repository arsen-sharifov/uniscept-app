'use client';

import { clsx } from 'clsx';
import { HelpCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { IToolGroup, IToolItem } from '@interfaces';

import { Skeleton } from '@/components/Skeleton';
import { buildHelpTool } from '@/components/tools';
import { useTranslations } from '@/i18n';

import { ICON_STROKE, TOOLTIP_DELAY_MS } from './consts';
import { ExportMenu, ShortcutsHelp, ToolButton, ToolbarSkeleton, ToolTooltip } from './fragments';
import { useToolbarShortcuts } from './hooks';
import { isTypingTarget } from './utils';

interface IToolHoverState {
  tool: IToolItem;
  top: number;
}

const noop = () => {};

export interface IToolbarProps {
  threadId?: string;
  threadName?: string;
  groups?: IToolGroup[];
  pendingGroupSizes?: number[];
  activeTool?: string;
  onToolClick?: (id: string) => void;
}

export const Toolbar = ({
  groups = [],
  pendingGroupSizes = [],
  activeTool,
  onToolClick,
  threadId,
  threadName,
}: IToolbarProps) => {
  useToolbarShortcuts();

  const t = useTranslations();
  const pending = pendingGroupSizes.length > 0;
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
        className="app-glass relative z-40 flex h-full w-14 shrink-0 flex-col items-stretch rounded-2xl border border-[color:var(--border)] transition-[background-color,border-color] duration-200 ease-out select-none motion-reduce:transition-none"
      >
        {pending && <ToolbarSkeleton groupSizes={pendingGroupSizes} />}

        <div hidden={pending} className="flex flex-1 flex-col items-stretch px-2 pt-1">
          {groups.map((group, index) => (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className={clsx(
                'flex flex-col items-stretch gap-1 py-2',
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

        {!pending && threadId && threadName && (
          <div className="mx-2 border-t border-[color:var(--border)] py-2" onPointerEnter={hideHover}>
            <ExportMenu key={threadId} threadId={threadId} threadName={threadName} />
          </div>
        )}

        <div className="mx-2 flex justify-center border-t border-[color:var(--border)] py-2">
          {pending ? (
            <span aria-hidden className="flex h-9 w-9 items-center justify-center">
              <Skeleton className="h-[17px] w-[17px]" />
            </span>
          ) : (
            <button
              ref={helpButtonRef}
              type="button"
              onClick={() => setHelpOpen(true)}
              onPointerEnter={handleHelpEnter}
              onPointerLeave={hideHover}
              onFocus={handleHelpEnter}
              onBlur={hideHover}
              aria-label={t.platform.canvas.shortcuts.ariaLabel}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[color:var(--text-muted)] transition-[background-color,color,box-shadow,transform] duration-200 ease-out outline-none hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface)] active:scale-[0.94] active:bg-[color:var(--surface-overlay)] motion-reduce:transition-none"
            >
              <HelpCircle className="h-[17px] w-[17px]" strokeWidth={ICON_STROKE} />
            </button>
          )}
        </div>
      </aside>

      <ToolTooltip tool={hover?.tool ?? null} top={hover?.top ?? -1000} visible={Boolean(hover)} />

      <ShortcutsHelp open={helpOpen} groups={groups} activeTool={activeTool} onClose={() => setHelpOpen(false)} />
    </>
  );
};
