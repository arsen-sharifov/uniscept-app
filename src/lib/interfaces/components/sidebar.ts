export interface ITopicItem {
  type: 'topic';
  id: string;
  name: string;
}

export interface IFolderItem {
  type: 'folder';
  id: string;
  name: string;
  items: TNavItem[];
}

export type TNavItem = ITopicItem | IFolderItem;

export interface IWorkspaceItem {
  id: string;
  name: string;
}

export interface IFlatTopic {
  id: string;
  name: string;
  parent_id: string | null;
  type: 'topic' | 'folder';
}
