'use client';

import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Link2,
  MessageCircle,
  MessageSquare,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';
import { ECanvasNodeType, type TCanvasContextMenu } from '@interfaces';
import { useClickOutside, useEscapeKey, useTranslations } from '@hooks';
import { useCanvasStore } from '@/lib/stores';
import { buildReferenceUrl, isCanvasNodeData } from '../utils';
import { MenuDivider, MenuItem } from './MenuItem';

interface IContextMenuProps {
  menu: TCanvasContextMenu;
  onClose: () => void;
}

export const ContextMenu = ({ menu, onClose }: IContextMenuProps) => {
  const t = useTranslations();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = useCanvasStore((s) => s.addNode);
  const setReferenceSearchPosition = useCanvasStore((s) => s.setReferenceSearchPosition);
  const setNodesStatus = useCanvasStore((s) => s.setNodesStatus);
  const duplicateNode = useCanvasStore((s) => s.duplicateNode);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const setOpenCommentsNodeId = useCanvasStore((s) => s.setOpenCommentsNodeId);
  const setCanvasCommentsOpen = useCanvasStore((s) => s.setCanvasCommentsOpen);

  const targetExists = useCanvasStore((s) => {
    if (menu.type === 'node') return s.nodes.some((n) => n.id === menu.nodeId);
    if (menu.type === 'edge') return s.edges.some((e) => e.id === menu.edgeId);
    return true;
  });

  useEffect(() => {
    if (!targetExists) onClose();
  }, [targetExists, onClose]);

  useEscapeKey(onClose);
  useClickOutside(containerRef, onClose);

  const close = useCallback(
    (action: () => void) => () => {
      action();
      onClose();
    },
    [onClose]
  );

  const getMenuItems = useCallback((): HTMLButtonElement[] => {
    const container = containerRef.current;
    if (!container) return [];
    return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
  }, []);

  useEffect(() => {
    const items = getMenuItems();
    if (items.length === 0) return;
    const first = items[0];
    if (!first) return;
    first.tabIndex = 0;
    first.focus();
  }, [getMenuItems]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const items = getMenuItems();
      if (items.length === 0) return;
      const currentIndex = items.findIndex((item) => item === document.activeElement);
      const focusAt = (index: number) => {
        items.forEach((item, i) => {
          item.tabIndex = i === index ? 0 : -1;
        });
        items[index]?.focus();
      };

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusAt(((currentIndex < 0 ? -1 : currentIndex) + 1) % items.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusAt(((currentIndex < 0 ? 0 : currentIndex) - 1 + items.length) % items.length);
        return;
      }
      if (event.key === 'Home') {
        event.preventDefault();
        focusAt(0);
        return;
      }
      if (event.key === 'End') {
        event.preventDefault();
        focusAt(items.length - 1);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        if (currentIndex >= 0) {
          event.preventDefault();
          items[currentIndex]?.click();
        }
      }
    },
    [getMenuItems]
  );

  const renderItems = (): ReactNode => {
    if (menu.type === 'pane') {
      return (
        <>
          <MenuItem
            icon={<Plus className="h-3 w-3" strokeWidth={2.25} />}
            label={t.platform.canvas.context.addNode}
            shortcut="N"
            onClick={close(() => addNode({ x: menu.flowX, y: menu.flowY }, t.platform.canvas.node.defaultLabel))}
            accent="emerald"
          />

          <MenuItem
            icon={<Link2 className="h-3 w-3" strokeWidth={2.25} />}
            label={t.platform.canvas.context.addReference}
            shortcut="R"
            onClick={close(() => setReferenceSearchPosition({ x: menu.flowX, y: menu.flowY }))}
            accent="cyan"
          />

          <MenuDivider />

          <MenuItem
            icon={<MessageCircle className="h-3 w-3" strokeWidth={2.25} />}
            label={t.platform.canvas.context.openComments}
            onClick={close(() => setCanvasCommentsOpen(true))}
          />
        </>
      );
    }

    if (menu.type === 'edge') {
      return (
        <MenuItem
          icon={<Trash2 className="h-3 w-3" strokeWidth={2.25} />}
          label={t.platform.canvas.context.deleteEdge}
          onClick={close(() => deleteEdge(menu.edgeId))}
          accent="red"
        />
      );
    }

    const node = useCanvasStore.getState().nodes.find((n) => n.id === menu.nodeId);
    if (!node) return null;

    if (node.type === ECanvasNodeType.Reference) {
      const sourceWorkspaceId = typeof node.data.sourceWorkspaceId === 'string' ? node.data.sourceWorkspaceId : '';
      const sourceThreadId = typeof node.data.sourceThreadId === 'string' ? node.data.sourceThreadId : '';
      const sourceNodeId = typeof node.data.sourceNodeId === 'string' ? node.data.sourceNodeId : '';
      const canNavigate = Boolean(sourceWorkspaceId && sourceThreadId && sourceNodeId);

      return (
        <>
          {canNavigate && (
            <>
              <MenuItem
                icon={<ExternalLink className="h-3 w-3" strokeWidth={2.25} />}
                label={t.platform.canvas.context.openReferenced}
                onClick={close(() => {
                  const url = buildReferenceUrl(sourceWorkspaceId, sourceThreadId, sourceNodeId);
                  if (url) router.push(url);
                })}
                accent="cyan"
              />

              <MenuDivider />
            </>
          )}

          <MenuItem
            icon={<Trash2 className="h-3 w-3" strokeWidth={2.25} />}
            label={t.platform.canvas.context.deleteReference}
            onClick={close(() => deleteNode(menu.nodeId))}
            accent="red"
          />
        </>
      );
    }

    if (!isCanvasNodeData(node.data)) return null;

    const { status } = node.data;

    return (
      <>
        <MenuItem
          icon={<CheckCircle className="h-3 w-3" strokeWidth={2.25} />}
          label={status === 'valid' ? t.platform.canvas.context.unmarkValid : t.platform.canvas.context.markValid}
          shortcut="Y"
          onClick={close(() => setNodesStatus([menu.nodeId], 'valid'))}
          accent="emerald"
        />

        <MenuItem
          icon={<XCircle className="h-3 w-3" strokeWidth={2.25} />}
          label={status === 'invalid' ? t.platform.canvas.context.unmarkInvalid : t.platform.canvas.context.markInvalid}
          shortcut="X"
          onClick={close(() => setNodesStatus([menu.nodeId], 'invalid'))}
          accent="red"
        />

        <MenuItem
          icon={<MessageSquare className="h-3 w-3" strokeWidth={2.25} />}
          label={t.platform.canvas.context.comment}
          shortcut="M"
          onClick={close(() => setOpenCommentsNodeId(menu.nodeId))}
        />

        <MenuDivider />

        <MenuItem
          icon={<Copy className="h-3 w-3" strokeWidth={2.25} />}
          label={t.platform.canvas.context.duplicate}
          onClick={close(() => duplicateNode(menu.nodeId))}
        />

        <MenuDivider />

        <MenuItem
          icon={<Trash2 className="h-3 w-3" strokeWidth={2.25} />}
          label={t.platform.canvas.context.delete}
          shortcut="⌫"
          onClick={close(() => deleteNode(menu.nodeId))}
          accent="red"
        />
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label={t.platform.canvas.context.ariaLabel}
      onKeyDown={handleKeyDown}
      style={{ left: menu.x, top: menu.y }}
      className="animate-rise-down fixed z-50 flex w-52 flex-col rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/95 p-1 text-[color:var(--text)] shadow-[0_18px_48px_-16px_rgba(15,23,42,0.42)] backdrop-blur-2xl motion-reduce:animate-none"
    >
      {renderItems()}
    </div>
  );
};
