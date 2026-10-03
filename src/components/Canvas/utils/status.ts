import type { Node } from '@xyflow/react';
import type { CSSProperties } from 'react';

import { ECanvasNodeType, type TNodeBandTone } from '@interfaces';

import { NODE_ALARM_WASHES } from '../consts';

export const collectStatusTargetIds = (nodes: Node[], clickedId: string): string[] => {
  const selectedIds = nodes
    .filter((node) => node.selected && node.type === ECanvasNodeType.Canvas)
    .map((node) => node.id);

  if (selectedIds.length > 1 && selectedIds.includes(clickedId)) {
    return selectedIds;
  }

  return [clickedId];
};

export const resolveNodeWashStyle = (
  tone: TNodeBandTone | undefined,
  isEditing: boolean,
): CSSProperties | undefined => {
  const wash = tone && !isEditing ? NODE_ALARM_WASHES[tone] : undefined;

  return wash ? { backgroundImage: `linear-gradient(${wash}, ${wash})` } : undefined;
};
