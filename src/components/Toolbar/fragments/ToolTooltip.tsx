import { clsx } from 'clsx';

import type { IToolItem } from '@interfaces';

import { renderShortcut } from '../utils';

interface IToolTooltipProps {
  tool: IToolItem | null;
  top: number;
  visible: boolean;
}

export const ToolTooltip = ({ tool, top, visible }: IToolTooltipProps) => {
  return (
    <div
      role="tooltip"
      aria-hidden={!visible}
      className={clsx(
        'pointer-events-none fixed right-[4.75rem] z-50 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-1 opacity-0',
      )}
      style={{ top }}
    >
      <div className="relative flex -translate-y-1/2 items-center gap-2 rounded-lg bg-[color:var(--text-strong)] py-1.5 pr-1.5 pl-2.5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55)]">
        <span className="text-[12px] font-medium tracking-tight text-[color:var(--surface)]">{tool?.label ?? ''}</span>

        {tool?.shortcut && (
          <div className="flex shrink-0 items-center gap-0.5 border-l border-[color:var(--surface)]/15 pl-1.5">
            {renderShortcut(tool.shortcut).map((token, idx) => (
              <kbd
                key={idx}
                className="flex h-4 min-w-[16px] items-center justify-center rounded-[4px] bg-[color:var(--surface)]/15 px-1 font-mono text-[9.5px] font-medium text-[color:var(--surface)]/85"
              >
                {token}
              </kbd>
            ))}
          </div>
        )}

        <span
          aria-hidden
          className="absolute top-1/2 -right-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-[color:var(--text-strong)]"
        />
      </div>
    </div>
  );
};
