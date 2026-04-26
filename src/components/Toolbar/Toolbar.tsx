'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import type { IToolGroup, IToolItem } from '@interfaces';
import { ShortcutsHelp, ToolButton, ToolTooltip } from './fragments';
import { useToolbarShortcuts } from './hooks';

const TOOLTIP_DELAY_MS = 450;
const HELP_TOOL: IToolItem = {
  id: 'help',
  icon: HelpCircle,
  label: 'Keyboard shortcuts',
  shortcut: '?',
};

export interface IToolbarProps {
  groups?: IToolGroup[];
  activeTool?: string;
  onToolClick?: (id: string) => void;
}

interface IHoverState {
  tool: IToolItem;
  top: number;
}

export const Toolbar = ({
  groups = [],
  activeTool,
  onToolClick,
}: IToolbarProps) => {
  useToolbarShortcuts();

  const [hover, setHover] = useState<IHoverState | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const showTimerRef = useRef<number | null>(null);
  const visibleRef = useRef(false);

  const clearShowTimer = () => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
  };

  useEffect(() => () => clearShowTimer(), []);

  const showHover = useCallback((next: IHoverState) => {
    clearShowTimer();
    if (visibleRef.current) {
      setHover(next);
      return;
    }
    showTimerRef.current = window.setTimeout(() => {
      visibleRef.current = true;
      setHover(next);
    }, TOOLTIP_DELAY_MS);
  }, []);

  const hideHover = useCallback(() => {
    clearShowTimer();
    visibleRef.current = false;
    setHover(null);
  }, []);

  const handleToolEnter = useCallback(
    (rect: DOMRect, tool: IToolItem) => {
      showHover({ tool, top: rect.top + rect.height / 2 });
    },
    [showHover]
  );

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== '?') return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
      setHelpOpen((prev) => !prev);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleHelpKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setHelpOpen(true);
    }
  };

  const helpButtonRef = useRef<HTMLButtonElement>(null);

  const handleHelpEnter = useCallback(() => {
    const rect = helpButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    showHover({ tool: HELP_TOOL, top: rect.top + rect.height / 2 });
  }, [showHover]);

  return (
    <>
      <aside
        aria-label="Canvas tools"
        onMouseLeave={hideHover}
        className={clsx(
          'fixed top-4 right-4 z-40 flex h-[calc(100vh-2rem)] w-14 flex-col items-stretch',
          'rounded-2xl border border-black/[0.06] bg-white/85 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-2xl select-none'
        )}
      >
        <div className="flex flex-1 flex-col items-stretch px-1.5 pt-3">
          {groups.map((group, index) => (
            <div
              key={group.id}
              role="group"
              aria-label={group.label}
              className={clsx(
                'flex flex-col items-stretch gap-0.5 py-1.5',
                index > 0 && 'border-t border-black/[0.06]'
              )}
            >
              {group.tools.map((tool) => (
                <ToolButton
                  key={tool.id}
                  tool={tool}
                  active={tool.id === activeTool}
                  onClick={(id) => onToolClick?.(id)}
                  onPointerEnter={handleToolEnter}
                  onPointerLeave={hideHover}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="border-t border-black/[0.06] px-1.5 py-2">
          <button
            ref={helpButtonRef}
            type="button"
            onClick={() => setHelpOpen(true)}
            onKeyDown={handleHelpKey}
            onPointerEnter={handleHelpEnter}
            onPointerLeave={hideHover}
            onFocus={handleHelpEnter}
            onBlur={hideHover}
            aria-label="Keyboard shortcuts"
            className={clsx(
              'flex h-9 w-9 items-center justify-center self-center rounded-[10px] outline-none',
              'text-black/40 transition-[background,color,transform] duration-150 ease-out motion-reduce:transition-none',
              'hover:bg-black/[0.05] hover:text-black/70 active:scale-[0.94]',
              'focus-visible:ring-2 focus-visible:ring-emerald-500/45'
            )}
          >
            <HelpCircle className="h-[15px] w-[15px]" strokeWidth={1.85} />
          </button>
        </div>
      </aside>

      <ToolTooltip
        tool={hover?.tool ?? null}
        top={hover?.top ?? -1000}
        visible={Boolean(hover)}
      />

      <ShortcutsHelp
        open={helpOpen}
        groups={groups}
        activeTool={activeTool}
        onClose={() => setHelpOpen(false)}
      />
    </>
  );
};
