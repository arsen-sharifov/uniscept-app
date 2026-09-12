'use client';

import { Handle, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';
import { type FocusEvent, type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import type { TCanvasNode } from '@interfaces';

import { useTranslations } from '@/i18n';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';
import { canEditNode } from '@/lib/utils';

import { HANDLE_POSITIONS } from './consts';
import { NodeBand } from './fragments';

export const QuestionNode = ({ id, data, selected }: NodeProps<TCanvasNode>) => {
  const t = useTranslations();
  const { label } = data;

  const pendingConnection = useCanvasStore((s) => s.pendingConnection);
  const editingNodeId = useCanvasStore((s) => s.editingNodeId);
  const setEditingNodeId = useCanvasStore((s) => s.setEditingNodeId);
  const updateNodeLabel = useCanvasStore((s) => s.updateNodeLabel);
  const userId = usePermissionsStore((s) => s.userId);
  const isOwner = usePermissionsStore((s) => s.isOwner);
  const canEditCanvas = usePermissionsStore((s) => s.canEditCanvas);

  const canEdit = canEditNode(data.createdBy, { userId, isOwner, canEditCanvas });
  const isPending = pendingConnection === id;
  const isEditing = editingNodeId === id && canEdit;
  const hasLabel = label.trim().length > 0;

  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    if (!isEditing) return;

    const input = inputRef.current;
    if (!input) return;

    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isEditing]);

  useEffect(
    () => () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    },
    [],
  );

  const labelRefCallback = useCallback((node: HTMLParagraphElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!node) return;

    const measure = () => setOverflows(node.scrollHeight - node.clientHeight > 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const commit = (value: string) => {
    updateNodeLabel(id, value.trim() || label);
    setEditingNodeId(null);
  };

  const handleBlur = (event: FocusEvent<HTMLTextAreaElement>) => commit(event.target.value);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      commit(event.currentTarget.value);

      return;
    }

    if (event.key === 'Escape') setEditingNodeId(null);
  };

  return (
    <div
      data-export-node
      className={clsx(
        'group/question relative flex max-w-[380px] min-w-[260px] flex-col overflow-visible rounded-xl border bg-[color:var(--surface-elevated)] shadow-[var(--shadow-pip)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-card-hover)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        isEditing ? 'border-[color:var(--border-active)]' : 'border-[color:var(--border-strong)]',
        selected && 'shadow-[var(--shadow-card-hover)] ring-[1.5px] ring-[color:var(--selection)]',
        isPending && 'animate-node-pulse ring-2 ring-[color:var(--ref-border)] motion-reduce:animate-none',
      )}
    >
      {HANDLE_POSITIONS.map(({ id: handleId, position }) => (
        <Handle
          key={handleId}
          id={handleId}
          type="source"
          position={position}
          isConnectable={canEditCanvas}
          className={clsx(
            '!h-2.5 !w-2.5 !rounded-full !border !border-[color:var(--surface)] !bg-[color:var(--accent)] !opacity-0 !shadow-[0_0_0_3px_var(--accent-soft)] !transition-opacity !duration-200',
            canEditCanvas ? 'group-hover/question:!opacity-100' : '!pointer-events-none',
          )}
        />
      ))}

      <div className="flex flex-col gap-2 px-5 pt-3.5 pb-4">
        <NodeBand tone="question" label={t.platform.canvas.question.badge} />

        {isEditing ? (
          <textarea
            ref={inputRef}
            defaultValue={label}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
            rows={1}
            placeholder={t.platform.canvas.question.placeholder}
            aria-label={t.platform.canvas.question.ariaLabel}
            className="nodrag field-sizing-content w-full resize-none overflow-hidden bg-transparent font-grotesk text-[17px] leading-[1.45] font-semibold tracking-tight break-words text-[color:var(--text-strong)] caret-[color:var(--accent)] outline-none placeholder:text-[color:var(--text-muted)]"
          />
        ) : (
          <p
            ref={hasLabel ? labelRefCallback : undefined}
            className={clsx(
              'font-grotesk text-[17px] leading-[1.45] font-semibold tracking-tight break-words whitespace-pre-wrap select-none',
              hasLabel ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-subtle)]',
              hasLabel && !expanded && 'line-clamp-8',
            )}
          >
            {hasLabel ? label : t.platform.canvas.question.placeholder}
          </p>
        )}

        {!isEditing && hasLabel && (overflows || expanded) && (
          <button
            data-export-omit
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            onMouseDown={(event) => event.stopPropagation()}
            className="nodrag inline-flex w-fit items-center gap-1 rounded-md font-mono-ui text-[10px] tracking-[0.04em] text-[color:var(--text-muted)] transition-colors duration-150 hover:text-[color:var(--accent-text)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none motion-reduce:transition-none"
          >
            <ChevronDown
              className={clsx('h-3 w-3 transition-transform duration-200', expanded && 'rotate-180')}
              strokeWidth={2.25}
            />
            {expanded ? t.platform.canvas.node.showLess : t.platform.canvas.node.showMore}
          </button>
        )}
      </div>
    </div>
  );
};
