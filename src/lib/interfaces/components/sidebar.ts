export type TNavItemType = 'folder' | 'thread';

export type TWorkspaceDropZone = 'before' | 'after';

export interface IThreadItem {
  type: 'thread';
  id: string;
  name: string;
}

export interface IFolderItem {
  type: 'folder';
  id: string;
  name: string;
  items: TNavItem[];
}

export type TNavItem = IThreadItem | IFolderItem;

export interface IWorkspaceItem {
  id: string;
  name: string;
}

export type TDropZone = 'before' | 'inside' | 'after';

export interface IFlattenedItem {
  id: string;
  name: string;
  type: TNavItemType;
  parentId: string | null;
  depth: number;
  index: number;
  collapsed: boolean;
  childCount: number;
}

export interface IProjection {
  depth: number;
  parentId: string | null;
  zone: TDropZone;
}

export interface IDragSelectRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TDeleteTarget =
  | {
      mode: 'single';
      id: string;
      name: string;
      type: 'workspace' | TNavItemType;
    }
  | {
      mode: 'bulk';
      scope: 'workspace' | 'navItem';
      ids: Set<string>;
      count: number;
    }
  | null;
