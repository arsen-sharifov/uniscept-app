import { create } from 'zustand';
import type { IFlatTopic, IWorkspaceItem, TNavItem } from '@interfaces';
import {
  fetchTopics,
  fetchWorkspaces,
  getCurrentUserId,
  insertTopic,
  insertWorkspace,
  removeTopic,
} from '@/lib/supabase';

const buildNavTree = (flatTopics: IFlatTopic[]): TNavItem[] => {
  const topLevel: TNavItem[] = [];
  const byId = new Map<string, TNavItem>();

  for (const t of flatTopics) {
    const item: TNavItem =
      t.type === 'folder'
        ? { type: 'folder', id: t.id, name: t.name, items: [] }
        : { type: 'topic', id: t.id, name: t.name };
    byId.set(t.id, item);
  }

  for (const t of flatTopics) {
    const item = byId.get(t.id);
    if (!item) continue;
    const parent = t.parent_id ? byId.get(t.parent_id) : undefined;

    if (parent && parent.type === 'folder') {
      parent.items.push(item);
    } else {
      topLevel.push(item);
    }
  }

  return topLevel;
};

interface IPlatformStore {
  workspaces: IWorkspaceItem[];
  activeWorkspaceId: string | null;
  navItems: TNavItem[];
  loading: boolean;
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<IWorkspaceItem>;
  selectWorkspace: (id: string) => Promise<void>;
  loadTopics: (workspaceId: string) => Promise<void>;
  createTopic: (name: string, parentId?: string) => Promise<string>;
  deleteTopic: (id: string) => Promise<void>;
}

export const usePlatformStore = create<IPlatformStore>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  navItems: [],
  loading: true,

  loadWorkspaces: async () => {
    set({ loading: true });
    try {
      let workspaces = await fetchWorkspaces();

      if (workspaces.length === 0) {
        const userId = await getCurrentUserId();
        if (userId) {
          const ws = await insertWorkspace('My Workspace', userId);
          workspaces = [ws];
        }
      }

      const mapped: IWorkspaceItem[] = workspaces.map((w) => ({
        id: w.id,
        name: w.name,
      }));

      set({ workspaces: mapped, loading: false });

      const first = mapped.at(0);
      if (!get().activeWorkspaceId && first) {
        await get().selectWorkspace(first.id);
      }
    } catch {
      set({ loading: false });
    }
  },

  createWorkspace: async (name) => {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('Not authenticated');

    const ws = await insertWorkspace(name, userId);
    const item: IWorkspaceItem = { id: ws.id, name: ws.name };
    set({ workspaces: [...get().workspaces, item] });
    return item;
  },

  selectWorkspace: async (id) => {
    set({ activeWorkspaceId: id });
    await get().loadTopics(id);
  },

  loadTopics: async (workspaceId) => {
    const topics = await fetchTopics(workspaceId);
    set({ navItems: buildNavTree(topics) });
  },

  createTopic: async (name, parentId) => {
    const workspaceId = get().activeWorkspaceId;
    if (!workspaceId) throw new Error('No active workspace');

    const topic = await insertTopic({
      name,
      workspace_id: workspaceId,
      parent_id: parentId ?? null,
      type: 'topic',
    });

    await get().loadTopics(workspaceId);
    return topic.id;
  },

  deleteTopic: async (id) => {
    await removeTopic(id);
    const workspaceId = get().activeWorkspaceId;
    if (workspaceId) {
      await get().loadTopics(workspaceId);
    }
  },
}));
