import { describe, expect, test, vi } from 'vitest';

import { ECanvasNodeType } from '@interfaces';
import { createThread, deleteThread, deleteThreads, getThreads, moveThread, updateThreadName } from '@api/client';
import { threadRow } from '@mocks/rows';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('getThreads', () => {
  describe('GIVEN threads where only one has an answer node', () => {
    describe('WHEN the threads are fetched', () => {
      test('THEN only the answered thread carries the hasAnswer flag', async () => {
        primeSupabase([
          { data: [threadRow(), threadRow({ id: 'th-2', name: 'Second', position: 1 })] },
          { data: [{ thread_id: 'th-2' }] },
        ]);

        await expect(getThreads('ws-1')).resolves.toEqual([
          expect.objectContaining({ id: 'th-1', hasAnswer: false }),
          expect.objectContaining({ id: 'th-2', name: 'Second', hasAnswer: true }),
        ]);
      });
    });
  });

  describe('GIVEN a workspace without threads', () => {
    describe('WHEN the threads are fetched', () => {
      test('THEN the answer lookup is skipped', async () => {
        const { client } = primeSupabase([{ data: [] }]);

        await expect(getThreads('ws-1')).resolves.toEqual([]);
        expect(client.from).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN a failing threads query', () => {
    describe('WHEN the threads are fetched', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(getThreads('ws-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('createThread', () => {
  describe('GIVEN a root thread in a workspace with siblings', () => {
    describe('WHEN the thread is created', () => {
      test('THEN the count is scoped to the root and a question node is seeded for the new thread', async () => {
        const { queries } = primeSupabase([{ count: 2 }, { data: threadRow() }, { data: null }]);
        const is = vi.spyOn(queries[0]!, 'is');

        await expect(createThread('ws-1')).resolves.toEqual({
          id: 'th-1',
          workspaceId: 'ws-1',
          folderId: null,
          name: 'Thread',
          position: 0,
          hasAnswer: false,
        });
        expect(is).toHaveBeenCalledExactlyOnceWith('folder_id', null);
        expect(queries[1]!.insert).toHaveBeenCalledExactlyOnceWith({
          workspace_id: 'ws-1',
          folder_id: null,
          position: 2,
        });
        expect(queries[2]!.insert).toHaveBeenCalledExactlyOnceWith(
          expect.objectContaining({
            thread_id: 'th-1',
            type: ECanvasNodeType.Question,
            position_x: 0,
            position_y: 0,
            label: '',
          }),
        );
      });
    });
  });

  describe('GIVEN a nested thread under a folder', () => {
    describe('WHEN the thread is created', () => {
      test('THEN the count is scoped to the folder and the thread takes the next position', async () => {
        const { queries } = primeSupabase([
          { count: 4 },
          { data: threadRow({ folder_id: 'folder-1' }) },
          { data: null },
        ]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await createThread('ws-1', 'folder-1');

        expect(eq).toHaveBeenCalledWith('folder_id', 'folder-1');
        expect(queries[1]!.insert).toHaveBeenCalledExactlyOnceWith({
          workspace_id: 'ws-1',
          folder_id: 'folder-1',
          position: 4,
        });
      });
    });
  });

  describe('GIVEN a question node insert that fails', () => {
    describe('WHEN the thread is created', () => {
      test('THEN the failure is swallowed and the thread is still returned', async () => {
        const { client } = primeSupabase([{ count: 2 }, { data: threadRow() }, { error: new Error('node down') }]);

        await expect(createThread('ws-1')).resolves.toEqual({
          id: 'th-1',
          workspaceId: 'ws-1',
          folderId: null,
          name: 'Thread',
          position: 0,
          hasAnswer: false,
        });
        expect(client.from).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('GIVEN a failing count query', () => {
    describe('WHEN the thread is created', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(createThread('ws-1')).rejects.toThrow('db down');
      });
    });
  });

  describe('GIVEN a failing insert', () => {
    describe('WHEN the thread is created', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ count: 0 }, { error: new Error('db down') }]);

        await expect(createThread('ws-1')).rejects.toThrow('db down');
      });
    });
  });

  describe('GIVEN an insert that returns no row', () => {
    describe('WHEN the thread is created', () => {
      test('THEN nothing is returned and no question node is seeded', async () => {
        const { client } = primeSupabase([{ count: 0 }, { data: null }]);

        await expect(createThread('ws-1')).resolves.toBeNull();
        expect(client.from).toHaveBeenCalledTimes(2);
      });
    });
  });
});

describe('updateThreadName', () => {
  describe('GIVEN an existing thread', () => {
    describe('WHEN the name is updated', () => {
      test('THEN the update targets the thread id with the new name', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await updateThreadName('th-1', 'Renamed');

        expect(queries[0]!.update).toHaveBeenCalledExactlyOnceWith({ name: 'Renamed' });
        expect(eq).toHaveBeenCalledExactlyOnceWith('id', 'th-1');
      });
    });
  });

  describe('GIVEN a failing update', () => {
    describe('WHEN the name is updated', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(updateThreadName('th-1', 'Renamed')).rejects.toThrow('db down');
      });
    });
  });
});

describe('deleteThread', () => {
  describe('GIVEN an existing thread', () => {
    describe('WHEN the thread is deleted', () => {
      test('THEN the delete targets the thread id', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await deleteThread('th-1');

        expect(queries[0]!.delete).toHaveBeenCalledTimes(1);
        expect(eq).toHaveBeenCalledExactlyOnceWith('id', 'th-1');
      });
    });
  });

  describe('GIVEN a failing delete', () => {
    describe('WHEN the thread is deleted', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(deleteThread('th-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('deleteThreads', () => {
  describe('GIVEN a set of thread ids', () => {
    describe('WHEN the threads are deleted', () => {
      test('THEN the delete targets the id set', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const inFilter = vi.spyOn(queries[0]!, 'in');

        await deleteThreads(['th-1', 'th-2']);

        expect(queries[0]!.delete).toHaveBeenCalledTimes(1);
        expect(inFilter).toHaveBeenCalledExactlyOnceWith('id', ['th-1', 'th-2']);
      });
    });
  });

  describe('GIVEN a failing delete', () => {
    describe('WHEN the threads are deleted', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(deleteThreads(['th-1', 'th-2'])).rejects.toThrow('db down');
      });
    });
  });
});

describe('moveThread', () => {
  describe('GIVEN a thread to relocate', () => {
    describe('WHEN the thread is moved', () => {
      test('THEN the update carries the new folder and position for the thread id', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await moveThread('th-1', 'folder-1', 5);

        expect(queries[0]!.update).toHaveBeenCalledExactlyOnceWith({ folder_id: 'folder-1', position: 5 });
        expect(eq).toHaveBeenCalledExactlyOnceWith('id', 'th-1');
      });
    });
  });

  describe('GIVEN a failing update', () => {
    describe('WHEN the thread is moved', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(moveThread('th-1', 'folder-1', 5)).rejects.toThrow('db down');
      });
    });
  });
});
