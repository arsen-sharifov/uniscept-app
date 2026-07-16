import { describe, expect, test, vi } from 'vitest';

import { createCanvasEdge, deleteCanvasEdge, getCanvasEdges } from '@api/client';
import { canvasEdgeRow } from '@mocks/rows';
import { primeSupabase } from '@mocks/supabase';

vi.mock('@/lib/supabase', () => import('@mocks/supabase'));

describe('createCanvasEdge', () => {
  describe('GIVEN a new edge input', () => {
    describe('WHEN the edge is created', () => {
      test('THEN the payload maps to snake case columns', async () => {
        const { queries } = primeSupabase([{ data: null }]);

        await createCanvasEdge({
          id: 'e1',
          threadId: 'th-1',
          sourceNodeId: 'n1',
          targetNodeId: 'n2',
          sourceHandle: 'right',
          targetHandle: 'left',
        });

        expect(queries[0]!.insert).toHaveBeenCalledExactlyOnceWith({
          id: 'e1',
          thread_id: 'th-1',
          source_node_id: 'n1',
          target_node_id: 'n2',
          source_handle: 'right',
          target_handle: 'left',
        });
      });
    });
  });

  describe('GIVEN a failing insert', () => {
    describe('WHEN the edge is created', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(
          createCanvasEdge({
            id: 'e1',
            threadId: 'th-1',
            sourceNodeId: 'n1',
            targetNodeId: 'n2',
            sourceHandle: 'right',
            targetHandle: 'left',
          }),
        ).rejects.toThrow('db down');
      });
    });
  });
});

describe('deleteCanvasEdge', () => {
  describe('GIVEN an existing edge', () => {
    describe('WHEN the edge is deleted', () => {
      test('THEN the delete targets the edge id', async () => {
        const { queries } = primeSupabase([{ data: null }]);
        const eq = vi.spyOn(queries[0]!, 'eq');

        await deleteCanvasEdge('e1');

        expect(queries[0]!.delete).toHaveBeenCalledTimes(1);
        expect(eq).toHaveBeenCalledExactlyOnceWith('id', 'e1');
      });
    });
  });

  describe('GIVEN a failing delete', () => {
    describe('WHEN the edge is deleted', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(deleteCanvasEdge('e1')).rejects.toThrow('db down');
      });
    });
  });
});

describe('getCanvasEdges', () => {
  describe('GIVEN stored edges for the thread', () => {
    describe('WHEN the edges are fetched', () => {
      test('THEN the rows are returned as is', async () => {
        primeSupabase([{ data: [canvasEdgeRow()] }]);

        await expect(getCanvasEdges('th-1')).resolves.toEqual([canvasEdgeRow()]);
      });
    });
  });

  describe('GIVEN no stored edges', () => {
    describe('WHEN the edges are fetched', () => {
      test('THEN an empty list is returned', async () => {
        primeSupabase([{ data: null }]);

        await expect(getCanvasEdges('th-1')).resolves.toEqual([]);
      });
    });
  });

  describe('GIVEN a failing query', () => {
    describe('WHEN the edges are fetched', () => {
      test('THEN the error propagates', async () => {
        primeSupabase([{ error: new Error('db down') }]);

        await expect(getCanvasEdges('th-1')).rejects.toThrow('db down');
      });
    });
  });
});
