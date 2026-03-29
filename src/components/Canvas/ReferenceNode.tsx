'use client';

import { Handle, type NodeProps, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import { ExternalLink } from 'lucide-react';
import type { TReferenceNode } from '@interfaces';

export const ReferenceNode = ({
  data,
  selected,
}: NodeProps<TReferenceNode>) => {
  const { label, sourceThreadName, sourceWorkspaceId } = data;

  return (
    <div
      className={clsx(
        'group relative min-w-[160px] rounded-2xl border border-dashed bg-white/50 px-4 py-3 shadow-md backdrop-blur-lg transition-all',
        selected ? 'ring-2 ring-cyan-400/50 ring-offset-1' : 'border-black/10'
      )}
    >
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm">
        <ExternalLink className="h-2.5 w-2.5 text-white" />
      </span>

      <p className="text-sm font-medium text-black/50 select-none">{label}</p>

      <p className="mt-0.5 truncate text-[10px] text-black/30">
        from: {sourceWorkspaceId} / {sourceThreadName}
      </p>

      <Handle
        id="top"
        type="target"
        position={Position.Top}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
      <Handle
        id="right"
        type="target"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
      <Handle
        id="bottom"
        type="target"
        position={Position.Bottom}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gradient-to-br !from-emerald-400 !to-cyan-400 !opacity-0 !transition-opacity group-hover:!opacity-100"
      />
    </div>
  );
};
