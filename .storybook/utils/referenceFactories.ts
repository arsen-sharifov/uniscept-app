import { ECanvasNodeType, type INodeReference, type TReferenceNode } from '@interfaces';

import { STORYBOOK_AUTHOR_ID, STORYBOOK_CREATED_AT } from '../consts';

export const createReferenceNode = (
  id: string,
  label: string,
  threadName: string,
  workspaceName: string,
  selected: boolean = false,
): TReferenceNode => ({
  id,
  type: ECanvasNodeType.Reference,
  position: { x: 0, y: 0 },
  selected,
  data: {
    label,
    sourceNodeId: 'src-node-1',
    sourceNodeLabel: label,
    sourceThreadId: 'src-thread-1',
    sourceThreadName: threadName,
    sourceWorkspaceId: 'src-workspace-1',
    sourceWorkspaceName: workspaceName,
    createdBy: STORYBOOK_AUTHOR_ID,
    createdAt: STORYBOOK_CREATED_AT,
  },
});

export const createNodeReference = (
  id: string,
  label: string,
  threadName: string,
  workspaceName: string,
): INodeReference => ({
  id,
  label,
  threadId: `thread-${id}`,
  threadName,
  workspaceId: `workspace-${id}`,
  workspaceName,
});
