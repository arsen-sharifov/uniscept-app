'use client';

import type { Edge, Node } from '@xyflow/react';
import { useEffect, useMemo, useState } from 'react';

import type { ITourSnapshot, ITourSnapshotInput, TTourAnchor } from '@interfaces';
import { ANCHOR_POLL_MS } from '@constants';
import { countReferenceTargets } from '@api/client';
import { event } from '@/lib/events';
import { readVisibleAnchors, useOnboardingStore } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

import { countFolders, countNestedThreads, sameAnchors } from '../utils';

const NO_ANCHORS: ReadonlySet<TTourAnchor> = new Set();

const NO_NODES: Node[] = [];

const NO_EDGES: Edge[] = [];

export const useTourSnapshot = ({
  items,
  workspaceId,
  workspaceCount,
  threadId: openThreadId,
  active,
}: ITourSnapshotInput): ITourSnapshot => {
  const storeNodes = useCanvasStore((state) => (active ? state.nodes : NO_NODES));
  const storeEdges = useCanvasStore((state) => (active ? state.edges : NO_EDGES));
  const activeTool = useCanvasStore((state) => state.activeTool);
  const loadedThreadId = useCanvasStore((state) => state.threadId);
  const openCommentsNodeId = useCanvasStore((state) => state.openCommentsNodeId);
  const pendingConnection = useCanvasStore((state) => state.pendingConnection);
  const signals = useOnboardingStore((state) => state.signals);

  const resolved = usePermissionsStore((state) => state.resolved);
  const canEditCanvas = usePermissionsStore((state) => state.canEditCanvas);
  const canComment = usePermissionsStore((state) => state.canComment);
  const canManageStructure = usePermissionsStore((state) => state.canManageStructure);
  const canManageMembers = usePermissionsStore((state) => state.canManageMembers);
  const canManageRoles = usePermissionsStore((state) => state.canManageRoles);

  const threadId = openThreadId !== null && loadedThreadId === openThreadId ? openThreadId : null;
  const nodes = threadId ? storeNodes : NO_NODES;
  const edges = threadId ? storeEdges : NO_EDGES;

  const [visibleAnchors, setVisibleAnchors] = useState<ReadonlySet<TTourAnchor>>(NO_ANCHORS);
  const [referenceTargetCount, setReferenceTargetCount] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timer = window.setInterval(() => {
      const next = readVisibleAnchors();
      setVisibleAnchors((previous) => (sameAnchors(previous, next) ? previous : next));
    }, ANCHOR_POLL_MS);

    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!active || !workspaceId) return;

    let cancelled = false;

    countReferenceTargets(workspaceId, threadId ?? undefined)
      .then((count) => {
        if (!cancelled) setReferenceTargetCount(count);
      })
      .catch((error: unknown) => event.error(error, { toast: false, context: 'onboarding.referenceTargets' }));

    return () => {
      cancelled = true;
    };
  }, [active, workspaceId, threadId]);

  const permissions = useMemo(
    () => ({
      resolved,
      canEditCanvas,
      canComment,
      canManageStructure,
      canManageMembers,
      canManageRoles,
    }),
    [resolved, canEditCanvas, canComment, canManageStructure, canManageMembers, canManageRoles],
  );

  const folderCount = useMemo(() => countFolders(items), [items]);
  const nestedThreadCount = useMemo(() => countNestedThreads(items), [items]);

  return useMemo(
    () => ({
      nodes,
      edges,
      activeTool,
      threadId,
      openCommentsNodeId,
      pendingConnection,
      workspaceCount,
      folderCount,
      nestedThreadCount,
      referenceTargetCount,
      permissions,
      visibleAnchors: active ? visibleAnchors : NO_ANCHORS,
      signals,
    }),
    [
      nodes,
      edges,
      activeTool,
      threadId,
      openCommentsNodeId,
      pendingConnection,
      workspaceCount,
      folderCount,
      nestedThreadCount,
      referenceTargetCount,
      permissions,
      visibleAnchors,
      signals,
      active,
    ],
  );
};
