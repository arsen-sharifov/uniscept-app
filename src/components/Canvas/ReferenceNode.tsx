'use client';

import type { MouseEvent } from 'react';
import { Handle, type NodeProps } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { ArrowUpRight, Link2 } from 'lucide-react';
import type { TReferenceNode } from '@interfaces';
import { HANDLE_POSITIONS } from './consts';
import { buildReferenceUrl } from './utils';

export const ReferenceNode = ({ data, selected }: NodeProps<TReferenceNode>) => {
  const t = useTranslations('platform.canvas.reference');
  const { sourceNodeId, sourceNodeLabel, sourceThreadId, sourceThreadName, sourceWorkspaceId, sourceWorkspaceName } =
    data;

  const router = useRouter();

  const canNavigate = Boolean(sourceWorkspaceId && sourceThreadId && sourceNodeId);

  const navigate = (event: MouseEvent) => {
    event.stopPropagation();

    const url = buildReferenceUrl(sourceWorkspaceId, sourceThreadId, sourceNodeId);
    if (!url) {
      return;
    }

    router.push(url);
  };

  return (
    <div
      onDoubleClick={navigate}
      className={clsx(
        'group/ref relative flex max-w-[280px] min-w-[200px] flex-col gap-1 overflow-visible rounded-2xl bg-[color:var(--surface-elevated)]/85 px-4 py-3 backdrop-blur-md transition-shadow duration-200',
        'shadow-[0_1px_2px_-1px_rgba(15,23,42,0.10),0_8px_22px_-14px_var(--ref-soft)]',
        'hover:shadow-[0_2px_4px_-1px_rgba(15,23,42,0.16),0_14px_32px_-18px_var(--ref-border)]',
        'ring-1 ring-inset',
        selected ? 'ring-2 ring-[color:var(--ref)]' : 'ring-[color:var(--ref-border)]'
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-[color:var(--ref-border)]"
      />

      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="target"
          position={position}
          className="!h-2.5 !w-2.5 !rounded-full !border !border-[color:var(--surface)] !bg-[color:var(--ref)] !opacity-0 !shadow-[0_0_0_3px_var(--ref-soft)] !transition-opacity group-hover/ref:!opacity-100"
        />
      ))}

      <div className="relative flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--ref-bg)] px-1.5 py-px text-[9px] font-semibold tracking-[0.12em] text-[color:var(--ref)] uppercase">
          <Link2 className="h-2.5 w-2.5" strokeWidth={2.25} />
          {t('badge')}
        </span>
        {canNavigate && (
          <button
            type="button"
            onClick={navigate}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={t('openLabel', { name: sourceNodeLabel })}
            className="nodrag ml-auto flex h-5 w-5 items-center justify-center rounded-md text-[color:var(--ref)] transition-[background,color,transform] duration-150 group-hover/ref:translate-x-px group-hover/ref:-translate-y-px hover:bg-[color:var(--ref-bg)]"
          >
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </button>
        )}
      </div>

      <p className="relative truncate text-[13px] font-medium tracking-tight text-[color:var(--text-strong)] select-none">
        {sourceNodeLabel}
      </p>

      <p className="relative flex items-center gap-1 truncate text-[10.5px] text-[color:var(--text-muted)]">
        <span className="truncate text-[color:var(--text-subtle)]">
          {sourceWorkspaceName || t('workspaceFallback')}
        </span>
        <span className="text-[color:var(--text-faint)]">/</span>
        <span className="truncate text-[color:var(--text-subtle)]">{sourceThreadName}</span>
      </p>
    </div>
  );
};
