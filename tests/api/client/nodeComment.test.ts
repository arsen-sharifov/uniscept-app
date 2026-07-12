import { describe, expect, test, vi } from 'vitest';

import { createNodeComment, deleteNodeComment, getNodeComments } from '@api/client';
import { nodeCommentRow } from '@mocks/rows';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('createNodeComment', () => {
  describe('GIVEN a signed-in user', () => {
    describe('WHEN a comment is created', () => {
      test('THEN the insert carries the resolved author id', async () => {
        const { queries } = primeSupabase([{ data: null }]);

        await createNodeComment({ id: 'c1', nodeId: 'n1', text: 'Nice catch' });

        expect(queries[0]!.insert).toHaveBeenCalledExactlyOnceWith({
          id: 'c1',
          node_id: 'n1',
          author_id: 'user-1',
          text: 'Nice catch',
        });
      });
    });
  });

  describe('GIVEN no signed-in user', () => {
    describe('WHEN a comment is created', () => {
      test('THEN the auth requirement error propagates and nothing is inserted', async () => {
        const { queries } = primeSupabase([{ data: null }], { user: null });

        await expect(createNodeComment({ id: 'c1', nodeId: 'n1', text: 'Nice catch' })).rejects.toThrow(
          'Authenticated user required',
        );
        expect(queries[0]!.insert).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a failing insert', () => {
    describe('WHEN a comment is created', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('insert failed') }]);

        await expect(createNodeComment({ id: 'c1', nodeId: 'n1', text: 'Nice catch' })).rejects.toThrow(
          'insert failed',
        );
      });
    });
  });
});

describe('deleteNodeComment', () => {
  describe('GIVEN an existing comment', () => {
    describe('WHEN the comment is deleted', () => {
      test('THEN the delete targets the comment id', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await deleteNodeComment('c-1');

        expect(queries[0]!.delete).toHaveBeenCalledTimes(1);
        expect(eq).toHaveBeenCalledExactlyOnceWith('id', 'c-1');
      });
    });
  });

  describe('GIVEN a failing delete', () => {
    describe('WHEN the comment is deleted', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(deleteNodeComment('c-1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('getNodeComments', () => {
  describe('GIVEN comments stored for the nodes', () => {
    describe('WHEN the comments are fetched', () => {
      test('THEN the rows are returned as is', async () => {
        primeSupabase([{ data: [nodeCommentRow()] }]);

        await expect(getNodeComments(['n1'])).resolves.toEqual([nodeCommentRow()]);
      });
    });
  });

  describe('GIVEN no node ids', () => {
    describe('WHEN the comments are fetched', () => {
      test('THEN the query is skipped', async () => {
        const { client } = primeSupabase([]);

        await expect(getNodeComments([])).resolves.toEqual([]);
        expect(client.from).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a failing query', () => {
    describe('WHEN the comments are fetched', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(getNodeComments(['n1'])).rejects.toThrow('db down');
      });
    });
  });
});
