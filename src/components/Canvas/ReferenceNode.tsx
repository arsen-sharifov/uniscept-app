'use client';

import { type MouseEvent } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { ArrowUpRight, Link2 } from 'lucide-react';
import type { TReferenceNode } from '@interfaces';

const HANDLE_BASE =
  '!h-2.5 !w-2.5 !rounded-full !border !border-white !bg-cyan-500 !shadow-[0_0_0_3px_rgba(6,182,212,0.18)] !opacity-0 !transition-opacity';

export const ReferenceNode = ({
  data,
  selected,
}: NodeProps<TReferenceNode>) => {
  const {
    label,
    sourceThreadId,
    sourceThreadName,
    sourceWorkspaceId,
    sourceWorkspaceName,
  } = data;

  const router = useRouter();

  const canNavigate = Boolean(sourceWorkspaceId && sourceThreadId);

  const navigate = (event: MouseEvent) => {
    event.stopPropagation();
    if (!canNavigate) return;
    router.push(`/platform/${sourceWorkspaceId}/${sourceThreadId}`);
  };

  return (
    <div
      onDoubleClick={navigate}
      title={canNavigate ? 'Double-click to open' : undefined}
      className={clsx(
        'group/ref relative flex max-w-[280px] min-w-[200px] flex-col gap-1 overflow-visible rounded-2xl bg-white/85 px-4 py-3 backdrop-blur-md transition-shadow duration-200',
        'shadow-[0_1px_2px_-1px_rgba(15,23,42,0.05),0_8px_22px_-14px_rgba(6,182,212,0.35)]',
        'hover:shadow-[0_2px_4px_-1px_rgba(15,23,42,0.08),0_14px_32px_-18px_rgba(6,182,212,0.45)]',
        'ring-1 ring-inset',
        selected ? 'ring-2 ring-cyan-500/55' : 'ring-cyan-500/20'
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl border border-dashed border-cyan-500/35"
      />

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className={clsx(HANDLE_BASE, 'group-hover/ref:!opacity-100')}
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className={clsx(HANDLE_BASE, 'group-hover/ref:!opacity-100')}
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className={clsx(HANDLE_BASE, 'group-hover/ref:!opacity-100')}
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className={clsx(HANDLE_BASE, 'group-hover/ref:!opacity-100')}
      />

      <div className="relative flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-1.5 py-px text-[9px] font-semibold tracking-[0.12em] text-cyan-700 uppercase">
          <Link2 className="h-2.5 w-2.5" strokeWidth={2.25} />
          Reference
        </span>
        {canNavigate && (
          <button
            type="button"
            onClick={navigate}
            onMouseDown={(event) => event.stopPropagation()}
            aria-label={`Open ${sourceThreadName}`}
            className="nodrag ml-auto flex h-5 w-5 items-center justify-center rounded-md text-cyan-600/70 transition-[background,color,transform] duration-150 group-hover/ref:translate-x-px group-hover/ref:-translate-y-px hover:bg-cyan-500/10 hover:text-cyan-700"
          >
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </button>
        )}
      </div>

      <p className="relative truncate text-[13px] font-medium tracking-tight text-neutral-900 select-none">
        {label}
      </p>

      <p className="relative flex items-center gap-1 truncate text-[10.5px] text-neutral-500">
        <span className="truncate text-neutral-400">
          {sourceWorkspaceName || 'workspace'}
        </span>
        <span className="text-neutral-300">/</span>
        <span className="truncate">{sourceThreadName}</span>
      </p>
    </div>
  );
};
