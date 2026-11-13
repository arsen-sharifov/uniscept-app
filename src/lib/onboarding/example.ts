'use client';

import type { Node } from '@xyflow/react';

import {
  ECanvasNodeType,
  type IAnchorRect,
  type IExampleCopy,
  type ISize,
  type TExampleCanvasAct,
  type TExampleNodeKey,
  type TExampleTarget,
  type THandleId,
} from '@interfaces';
import {
  EXAMPLE_CANVAS_TIMEOUT_MS,
  EXAMPLE_CARD_CLEARANCE_PX,
  EXAMPLE_COMMENT_RESERVE,
  EXAMPLE_FIT_MARGIN,
  EXAMPLE_NODES,
  EXAMPLE_STEP_DELAY_MS,
  TOUR_CARD_SELECTOR,
} from '@constants';
import { ECanvasTool } from '@/components/tools';
import { HANDLE_IDS, findNearestHandlePair, toNodeRect } from '@/lib/canvas';
import { useCanvasStore } from '@/lib/stores';

import { findAnchorElement } from './anchors';

const EXAMPLE_KEYS = Object.keys(EXAMPLE_NODES) as TExampleNodeKey[];

const measureContent = (nodes: readonly Node[]): ISize => {
  const rects = nodes.map(toNodeRect);
  const left = Math.min(...rects.map(({ x }) => x));
  const top = Math.min(...rects.map(({ y }) => y));

  return {
    width: Math.max(...rects.map(({ x, width }) => x + width)) - left,
    height: Math.max(...rects.map(({ y, height }) => y + height)) - top,
  };
};

const measureReach = (canvas: IAnchorRect, card: IAnchorRect): Record<THandleId, number> => ({
  top: card.top + card.height - canvas.top,
  right: canvas.left + canvas.width - card.left,
  bottom: canvas.top + canvas.height - card.top,
  left: card.left + card.width - canvas.left,
});

const measureZoom = (canvas: IAnchorRect, padding: Record<THandleId, number>, content: ISize) =>
  Math.min(
    (canvas.width - padding.left - padding.right) / Math.max(content.width, 1),
    (canvas.height - padding.top - padding.bottom) / Math.max(content.height, 1),
  );

export const pickExampleFitPadding = (
  canvas: IAnchorRect,
  card: IAnchorRect | null,
  content: ISize,
  reserve: Partial<Record<THandleId, number>> = {},
): Record<THandleId, number> => {
  const measureMargin = (side: THandleId, extent: number) => extent * EXAMPLE_FIT_MARGIN[side] + (reserve[side] ?? 0);
  const margins: Record<THandleId, number> = {
    top: measureMargin('top', canvas.height),
    right: measureMargin('right', canvas.width),
    bottom: measureMargin('bottom', canvas.height),
    left: measureMargin('left', canvas.width),
  };
  if (!card) return margins;

  const reach = measureReach(canvas, card);
  if (HANDLE_IDS.some((side) => reach[side] <= 0)) return margins;

  const [roomiest = margins] = HANDLE_IDS.map((side) => ({
    ...margins,
    [side]: Math.max(margins[side], reach[side] + EXAMPLE_CARD_CLEARANCE_PX),
  })).toSorted((first, second) => measureZoom(canvas, second, content) - measureZoom(canvas, first, content));

  return roomiest;
};

const fitAroundCard = (nodeIds?: readonly string[], reserve?: Partial<Record<THandleId, number>>) => {
  const store = useCanvasStore.getState();
  const canvas = findAnchorElement('canvas')?.getBoundingClientRect();
  if (!canvas) {
    store.requestFit({ nodeIds });

    return;
  }

  const targets = nodeIds ? store.nodes.filter((node) => nodeIds.includes(node.id)) : store.nodes;
  const card = document.querySelector(TOUR_CARD_SELECTOR)?.getBoundingClientRect() ?? null;
  const padding = pickExampleFitPadding(canvas, card, measureContent(targets), reserve);

  store.requestFit({
    padding: {
      top: `${Math.round(padding.top)}px`,
      right: `${Math.round(padding.right)}px`,
      bottom: `${Math.round(padding.bottom)}px`,
      left: `${Math.round(padding.left)}px`,
    },
    nodeIds,
  });
};

const pause = () => new Promise<void>((resolve) => window.setTimeout(resolve, EXAMPLE_STEP_DELAY_MS));

const inTurn = (moves: readonly (() => void)[], isLive: () => boolean) =>
  moves.reduce<Promise<void>>(async (previous, move) => {
    await previous;
    if (!isLive()) return;

    move();
    await pause();
  }, Promise.resolve());

const pickTool = (tool: ECanvasTool) => () => useCanvasStore.getState().setActiveTool(tool);

const findNode = (id: string) => useCanvasStore.getState().nodes.find((node) => node.id === id) ?? null;

const placeNode = (key: TExampleNodeKey, ids: Record<TExampleTarget, string>) => {
  const { x, y } = EXAMPLE_NODES[key];
  const store = useCanvasStore.getState();
  store.addNode({ x, y }, ids[key]);
  fitAroundCard();
};

const linkNode = (key: TExampleNodeKey, ids: Record<TExampleTarget, string>) => {
  const source = findNode(ids[EXAMPLE_NODES[key].parent]);
  const target = findNode(ids[key]);
  if (!source || !target) return;

  useCanvasStore
    .getState()
    .connectNodes({ source: source.id, target: target.id, ...findNearestHandlePair(source, target) });
};

const movesOf = (act: TExampleCanvasAct, copy: IExampleCopy, ids: Record<TExampleTarget, string>) => {
  const store = useCanvasStore.getState();

  switch (act.type) {
    case 'argue':
      return act.keys.flatMap((key) => [
        pickTool(ECanvasTool.AddNode),
        () => placeNode(key, ids),
        () => store.updateNodeLabel(ids[key], copy.nodes[key]),
        () => {
          store.setActiveTool(ECanvasTool.Connect);
          fitAroundCard();
        },
        () => linkNode(key, ids),
      ]);
    case 'comment':
      return [
        () => store.setOpenCommentsNodeId(ids[act.key]),
        () => fitAroundCard([ids[act.key]], EXAMPLE_COMMENT_RESERVE),
        () => store.addComment(ids[act.key], copy.comments[act.key]),
      ];
    case 'status':
      return [
        pickTool(act.status === 'valid' ? ECanvasTool.ValidPath : ECanvasTool.InvalidPath),
        () => fitAroundCard(),
        ...act.keys.map((key) => () => store.setNodeStatus(ids[key], act.status)),
      ];
    case 'answer':
      return [pickTool(ECanvasTool.Answer), () => fitAroundCard(), () => store.setNodeAnswer(ids[act.key])];
    case 'frame':
      return [pickTool(ECanvasTool.Select), () => fitAroundCard()];
  }
};

const findQuestionId = (threadId: string): string | null => {
  const { threadId: loadedThreadId, hydrated, nodes } = useCanvasStore.getState();
  if (loadedThreadId !== threadId || !hydrated) return null;

  return nodes.find((node) => node.type === ECanvasNodeType.Question)?.id ?? null;
};

export const waitForExampleCanvas = (threadId: string): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const stop = () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
    const settle = () => {
      const questionId = findQuestionId(threadId);
      if (!questionId) return;

      stop();
      resolve(questionId);
    };
    const unsubscribe = useCanvasStore.subscribe(settle);
    const timer = window.setTimeout(() => {
      stop();
      reject(new Error('The example canvas did not load'));
    }, EXAMPLE_CANVAS_TIMEOUT_MS);

    settle();
  });

export const createExampleIds = (questionId: string): Record<TExampleTarget, string> =>
  Object.fromEntries([['question', questionId], ...EXAMPLE_KEYS.map((key) => [key, crypto.randomUUID()])]) as Record<
    TExampleTarget,
    string
  >;

export const writeExampleQuestion = (
  copy: IExampleCopy,
  ids: Record<TExampleTarget, string>,
  isLive: () => boolean,
): Promise<void> => {
  const store = useCanvasStore.getState();

  return inTurn(
    [
      () => store.setEditingNodeId(null),
      () => {
        store.updateNodeLabel(ids.question, copy.question);
        fitAroundCard();
      },
    ],
    isLive,
  );
};

export const playExampleAct = async (
  act: TExampleCanvasAct,
  copy: IExampleCopy,
  ids: Record<TExampleTarget, string>,
  isLive: () => boolean,
): Promise<void> => {
  await inTurn(movesOf(act, copy, ids), isLive);
  if (isLive()) useCanvasStore.getState().setActiveTool(ECanvasTool.Select);
};
