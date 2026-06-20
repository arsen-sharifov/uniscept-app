'use client';

import { Handle, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

import type { TReferenceNode } from '@interfaces';
import { useTranslations } from '@hooks';

import { HANDLE_POSITIONS } from './consts';
import { NodeBand } from './fragments';
import { buildReferenceUrl } from './utils';

export const ReferenceNode = ({ data, selected }: NodeProps<TReferenceNode>) => {
  const t = useTranslations();
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
        'group/ref relative flex max-w-[280px] min-w-[200px] flex-col overflow-visible rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[0_2px_10px_-5px_rgba(15,23,42,0.18)] transition-shadow duration-200 hover:shadow-[0_5px_16px_-6px_rgba(15,23,42,0.28)]',
        selected && 'ring-2 ring-[color:var(--border-active)]',
      )}
    >
      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="target"
          position={position}
          className="!h-2.5 !w-2.5 !rounded-full !border !border-[color:var(--surface)] !bg-[color:var(--ref)] !opacity-0 !shadow-[0_0_0_3px_var(--ref-soft)] !transition-opacity group-hover/ref:!opacity-100"
        />
      ))}

      <NodeBand
        tone="reference"
        label={t.platform.canvas.reference.badge}
        trailing={
          canNavigate && (
            <button
              type="button"
              onClick={navigate}
              onMouseDown={(event) => event.stopPropagation()}
              aria-label={t('platform.canvas.reference.openLabel', { name: sourceNodeLabel })}
              className="nodrag flex h-4 w-4 items-center justify-center rounded transition-transform duration-150 group-hover/ref:translate-x-px group-hover/ref:-translate-y-px"
            >
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.25} />
            </button>
          )
        }
      />

      <div className="flex flex-col gap-1 px-4 py-3">
        <p className="truncate text-[13px] font-medium tracking-tight text-[color:var(--text-strong)] select-none">
          {sourceNodeLabel}
        </p>

        <p className="flex items-center gap-1 truncate text-[10.5px] text-[color:var(--text-muted)]">
          <span className="truncate text-[color:var(--text-subtle)]">
            {sourceWorkspaceName || t.platform.canvas.reference.workspaceFallback}
          </span>
          <span className="text-[color:var(--text-faint)]">/</span>
          <span className="truncate text-[color:var(--text-subtle)]">{sourceThreadName}</span>
        </p>
      </div>
    </div>
  );
};
