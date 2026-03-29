import type {
  IFlattenedItem,
  IProjection,
  TDropZone,
  TNavItem,
} from '@interfaces';
import { MAX_DEPTH } from '../../consts';

const countDescendants = (items: TNavItem[]): number =>
  items.reduce(
    (sum, item) =>
      sum + 1 + (item.type === 'folder' ? countDescendants(item.items) : 0),
    0
  );

export const flattenTree = (
  items: TNavItem[],
  collapsedIds: Set<string>,
  parentId: string | null = null,
  depth = 0
): IFlattenedItem[] =>
  items.flatMap((item, index) => {
    const isFolder = item.type === 'folder';
    const collapsed = isFolder && collapsedIds.has(item.id);
    const children =
      isFolder && !collapsed
        ? flattenTree(item.items, collapsedIds, item.id, depth + 1)
        : [];
    const childCount = isFolder
      ? collapsed
        ? countDescendants(item.items)
        : children.length
      : 0;

    const flatItem: IFlattenedItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      parentId,
      depth,
      index,
      collapsed,
      childCount,
    };

    return [flatItem, ...children];
  });

const isDescendantOf = (
  flatItems: IFlattenedItem[],
  itemId: string,
  potentialAncestorId: string
): boolean => {
  if (itemId === potentialAncestorId) return true;
  const parentId = flatItems.find((item) => item.id === itemId)?.parentId;
  return !!parentId && isDescendantOf(flatItems, parentId, potentialAncestorId);
};

export const getProjection = (
  flatItems: IFlattenedItem[],
  activeId: string,
  overId: string,
  zone: TDropZone
): IProjection | null => {
  const activeIndex = flatItems.findIndex((item) => item.id === activeId);
  const overIndex = flatItems.findIndex((item) => item.id === overId);
  if (activeIndex === -1 || overIndex === -1) return null;

  const activeItem = flatItems[activeIndex] as IFlattenedItem;
  const overItem = flatItems[overIndex] as IFlattenedItem;
  const maxDepth = activeItem.type === 'folder' ? MAX_DEPTH - 1 : MAX_DEPTH;

  if (
    zone === 'inside' &&
    overItem.type === 'folder' &&
    overItem.id !== activeId
  ) {
    const depth = overItem.depth + 1;
    if (depth <= maxDepth) {
      if (
        activeItem.type !== 'folder' ||
        !isDescendantOf(flatItems, overItem.id, activeId)
      ) {
        return { depth, parentId: overItem.id, zone: 'inside' };
      }
    }
  }

  let parentId: string | null = overItem.parentId;
  let depth: number = overItem.depth;

  if (depth > maxDepth) {
    parentId = null;
    depth = 0;
  }

  if (activeItem.type === 'folder' && parentId) {
    if (isDescendantOf(flatItems, parentId, activeId)) return null;
  }

  return { depth, parentId, zone };
};

export const removeChildrenOf = (
  flatItems: IFlattenedItem[],
  ids: Set<string>
): IFlattenedItem[] => {
  const excluded = flatItems.reduce((acc, item) => {
    if (item.parentId && (ids.has(item.parentId) || acc.has(item.parentId))) {
      acc.add(item.id);
    }
    return acc;
  }, new Set<string>());

  return flatItems.filter((item) => !excluded.has(item.id));
};
