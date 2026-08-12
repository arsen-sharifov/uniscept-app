import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ECanvasNodeType } from '@interfaces';
import {
  createCanvasEdge,
  createCanvasNode,
  createNodeComment,
  deleteCanvasEdge,
  deleteCanvasNode,
  deleteNodeComment,
  updateCanvasNodeAnswer,
  updateCanvasNodeLabel,
  updateCanvasNodePositions,
  updateCanvasNodeStatus,
} from '@api/client';
import {
  THREAD_ID,
  createCommentOp,
  createEdgeOp,
  createNodeOp,
  createReferenceNodeOp,
  deleteCommentOp,
  deleteEdgeOp,
  deleteNodeOp,
  updateAnswerOp,
  updateLabelOp,
  updatePositionOp,
  updateStatusOp,
} from '@mocks/canvas';
import {
  FLUSH_DEBOUNCE_MS,
  MAX_RETRIES,
  OFFLINE_POLL_INTERVAL_MS,
  RETRY_BASE_MS,
  discardFailed,
  enqueueOperation,
  flushNow,
  getSaveState,
  resetQueue,
  retryFailed,
  subscribeFailedOperations,
  subscribeSaveState,
} from '@/lib/canvas';

vi.mock('@api/client', () => import('@mocks/canvasApi'));

const TOTAL_RETRY_BACKOFF_MS = RETRY_BASE_MS * (2 ** MAX_RETRIES - 1);

const unsubscribers: Array<() => void> = [];

const onSaveState = vi.fn();
const onFailedOperations = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  Reflect.deleteProperty(window.navigator, 'onLine');
  window.dispatchEvent(new Event('online'));
  resetQueue();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('queue', () => {
  describe('GIVEN a node created in the pending batch', () => {
    beforeEach(() => {
      enqueueOperation(createNodeOp('n1'));
      enqueueOperation(updateLabelOp('n1', 'renamed'));
    });

    describe('WHEN it is deleted before the flush', () => {
      beforeEach(async () => {
        enqueueOperation(deleteNodeOp('n1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN nothing is sent to the api', () => {
        expect(createCanvasNode).not.toHaveBeenCalled();
        expect(updateCanvasNodeLabel).not.toHaveBeenCalled();
        expect(deleteCanvasNode).not.toHaveBeenCalled();
      });

      test('THEN the state reports saved', () => {
        expect(getSaveState()).toMatchObject({ status: 'saved', pendingCount: 0 });
      });
    });
  });

  describe('GIVEN an edge and a comment created in the pending batch', () => {
    beforeEach(() => {
      enqueueOperation(createEdgeOp('e1'));
      enqueueOperation(createCommentOp('c1'));
    });

    describe('WHEN they are deleted before the flush', () => {
      beforeEach(async () => {
        enqueueOperation(deleteEdgeOp('e1'));
        enqueueOperation(deleteCommentOp('c1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN nothing is sent to the api', () => {
        expect(createCanvasEdge).not.toHaveBeenCalled();
        expect(deleteCanvasEdge).not.toHaveBeenCalled();
        expect(createNodeComment).not.toHaveBeenCalled();
        expect(deleteNodeComment).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a reference node created in the pending batch', () => {
    beforeEach(() => {
      enqueueOperation(createReferenceNodeOp('r1'));
    });

    describe('WHEN it is deleted before the flush', () => {
      beforeEach(async () => {
        enqueueOperation(deleteNodeOp('r1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN nothing is sent to the api', () => {
        expect(createCanvasNode).not.toHaveBeenCalled();
        expect(deleteCanvasNode).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the debounce window closes', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN it is sent as a reference-typed canvas node', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith({
          id: 'r1',
          threadId: THREAD_ID,
          type: ECanvasNodeType.Reference,
          x: 0,
          y: 0,
          label: 'Ref',
          sourceNodeId: 'origin',
        });
      });
    });
  });

  describe('GIVEN nodes persisted before the batch', () => {
    describe('WHEN a node is updated and then deleted', () => {
      beforeEach(async () => {
        enqueueOperation(updateLabelOp('n1', 'renamed'));
        enqueueOperation(deleteNodeOp('n1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN only the delete is sent', () => {
        expect(updateCanvasNodeLabel).not.toHaveBeenCalled();
        expect(deleteCanvasNode).toHaveBeenCalledExactlyOnceWith('n1');
      });
    });

    describe('WHEN a label is updated twice and a status is set', () => {
      beforeEach(async () => {
        enqueueOperation(updateLabelOp('n1', 'draft'));
        enqueueOperation(updateLabelOp('n1', 'final'));
        enqueueOperation(updateStatusOp('n1', 'valid'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN only the final values are sent', () => {
        expect(updateCanvasNodeLabel).toHaveBeenCalledExactlyOnceWith('n1', 'final');
        expect(updateCanvasNodeStatus).toHaveBeenCalledExactlyOnceWith('n1', 'valid');
      });
    });

    describe('WHEN the answer flag is toggled twice for the same node', () => {
      beforeEach(async () => {
        enqueueOperation(updateAnswerOp('n1', true));
        enqueueOperation(updateAnswerOp('n1', false));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN only the final answer value is sent', () => {
        expect(updateCanvasNodeAnswer).toHaveBeenCalledExactlyOnceWith('n1', false);
      });
    });

    describe('WHEN positions change repeatedly', () => {
      beforeEach(async () => {
        enqueueOperation(updatePositionOp('n1', 1, 1));
        enqueueOperation(updatePositionOp('n2', 2, 2));
        enqueueOperation(updatePositionOp('n1', 9, 9));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN one batched call keeps the last position per node', () => {
        expect(updateCanvasNodePositions).toHaveBeenCalledExactlyOnceWith([
          { id: 'n1', x: 9, y: 9 },
          { id: 'n2', x: 2, y: 2 },
        ]);
      });
    });

    describe('WHEN a position update precedes a node creation', () => {
      beforeEach(async () => {
        enqueueOperation(updatePositionOp('n1', 5, 5));
        enqueueOperation(createNodeOp('n2'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN positions are sent after the create', () => {
        expect(vi.mocked(updateCanvasNodePositions).mock.invocationCallOrder[0]).toBeGreaterThan(
          vi.mocked(createCanvasNode).mock.invocationCallOrder[0]!,
        );
      });
    });
  });

  describe('GIVEN consecutive enqueues within one debounce window', () => {
    beforeEach(async () => {
      enqueueOperation(createNodeOp('n1'));
      await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS - 1);
      enqueueOperation(createNodeOp('n2'));
    });

    describe('WHEN the debounce window has not yet closed', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS - 1);
      });

      test('THEN nothing is sent yet', () => {
        expect(createCanvasNode).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the debounce window closes', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN both nodes flush in one batch', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
      });

      test('THEN the create payload maps every field', () => {
        expect(createCanvasNode).toHaveBeenCalledWith({
          id: 'n1',
          threadId: THREAD_ID,
          type: ECanvasNodeType.Canvas,
          x: 0,
          y: 0,
          label: 'Node n1',
          sourceNodeId: null,
        });
      });
    });
  });

  describe('GIVEN an idle queue with a save state subscriber', () => {
    beforeEach(() => {
      unsubscribers.push(subscribeSaveState(onSaveState));
    });

    describe('WHEN a batch flushes successfully', () => {
      beforeEach(async () => {
        enqueueOperation(createNodeOp('n1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN it reports saving and then saved', () => {
        expect(onSaveState.mock.calls.map(([state]) => state)).toMatchObject([
          { status: 'idle', pendingCount: 0 },
          { status: 'saving', pendingCount: 1 },
          { status: 'saved', pendingCount: 0 },
        ]);
      });

      test('THEN it records the save timestamp', () => {
        expect(getSaveState().lastSavedAt).not.toBeNull();
      });
    });
  });

  describe('GIVEN a detached save state subscriber', () => {
    beforeEach(() => {
      const unsubscribe = subscribeSaveState(onSaveState);
      unsubscribe();
    });

    describe('WHEN operations are enqueued', () => {
      beforeEach(() => {
        enqueueOperation(createNodeOp('n1'));
      });

      test('THEN no further states arrive', () => {
        expect(onSaveState).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('GIVEN an in-flight flush with an operation enqueued behind it', () => {
    let settleInflight: () => void;

    beforeEach(async () => {
      const deferred = Promise.withResolvers<void>();
      settleInflight = deferred.resolve;
      vi.mocked(createCanvasNode).mockReturnValueOnce(deferred.promise);
      enqueueOperation(createNodeOp('n1'));
      await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      enqueueOperation(createNodeOp('n2'));
    });

    describe('WHEN the flush window passes again', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the pending operation stays out of the in-flight batch', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(1);
      });
    });

    describe('WHEN the in-flight save settles', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        settleInflight();
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the pending operation flushes in a follow-up batch', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
        expect(createCanvasNode).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'n2' }));
      });

      test('THEN the state reports saved', () => {
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a flush that fails twice', () => {
    beforeEach(() => {
      vi.mocked(createCanvasNode).mockRejectedValueOnce(new Error('first')).mockRejectedValueOnce(new Error('second'));
      unsubscribers.push(subscribeSaveState(onSaveState));
      enqueueOperation(createNodeOp('n1'));
    });

    describe('WHEN the first and second backoff windows elapse', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS * 2 - 1);
      });

      test('THEN the third attempt has not fired yet', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
      });

      test('THEN the retry attempts are reported in order', () => {
        expect(
          onSaveState.mock.calls
            .map(([state]) => state)
            .filter((state) => state.status === 'retrying')
            .map((state) => state.retryAttempt),
        ).toEqual([1, 2]);
      });
    });

    describe('WHEN the full backoff elapses', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS * 2);
      });

      test('THEN the third attempt saves the batch', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(3);
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a pending operation before the debounce closes', () => {
    beforeEach(() => {
      enqueueOperation(createNodeOp('n1'));
    });

    describe('WHEN flushNow is called directly', () => {
      beforeEach(async () => {
        await flushNow();
      });

      test('THEN the operation is sent without waiting for the debounce', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 'n1' }));
        expect(getSaveState()).toMatchObject({ status: 'saved', pendingCount: 0 });
      });
    });
  });

  describe('GIVEN a batch with a position change followed by a failing create', () => {
    beforeEach(() => {
      vi.mocked(createCanvasNode).mockRejectedValueOnce(new Error('create failed'));
      enqueueOperation(updatePositionOp('n1', 5, 5));
      enqueueOperation(createNodeOp('n2'));
    });

    describe('WHEN the flush fails once and then retries', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS);
      });

      test('THEN the position update is not lost and is sent on the retry', () => {
        expect(updateCanvasNodePositions).toHaveBeenCalledExactlyOnceWith([{ id: 'n1', x: 5, y: 5 }]);
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a position batch that fails to save', () => {
    beforeEach(() => {
      vi.mocked(updateCanvasNodePositions).mockRejectedValueOnce(new Error('positions failed'));
      enqueueOperation(updatePositionOp('n1', 5, 5));
      enqueueOperation(updatePositionOp('n2', 9, 9));
    });

    describe('WHEN the flush fails once and then retries', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS);
      });

      test('THEN both positions are retried together and saved', () => {
        expect(updateCanvasNodePositions).toHaveBeenCalledTimes(2);
        expect(updateCanvasNodePositions).toHaveBeenLastCalledWith([
          { id: 'n1', x: 5, y: 5 },
          { id: 'n2', x: 9, y: 9 },
        ]);
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a batch whose edge create fails once', () => {
    beforeEach(() => {
      vi.mocked(createCanvasEdge).mockRejectedValueOnce(new Error('edge failed'));
      enqueueOperation(createNodeOp('n1'));
      enqueueOperation(createEdgeOp('e1'));
    });

    describe('WHEN the flush and the retry run', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(RETRY_BASE_MS);
      });

      test('THEN the completed create is not re-sent', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(1);
      });

      test('THEN the failed edge is retried and saved', () => {
        expect(createCanvasEdge).toHaveBeenCalledTimes(2);
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN an api that keeps failing', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(createCanvasNode).mockRejectedValue(new Error('down'));
      unsubscribers.push(subscribeFailedOperations(onFailedOperations));
    });

    describe('WHEN the retries are exhausted', () => {
      beforeEach(async () => {
        enqueueOperation(createNodeOp('n1'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        await vi.advanceTimersByTimeAsync(TOTAL_RETRY_BACKOFF_MS);
      });

      test('THEN the batch parks in failed operations', () => {
        expect(getSaveState()).toMatchObject({ status: 'error', failedCount: 1, pendingCount: 0 });
        expect(onFailedOperations).toHaveBeenLastCalledWith([createNodeOp('n1')]);
      });

      test('THEN the api attempts stop at the retry limit', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(1 + MAX_RETRIES);
      });
    });
  });

  describe('GIVEN a batch parked in failed operations', () => {
    beforeEach(async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(createCanvasNode).mockRejectedValue(new Error('save failed'));
      enqueueOperation(createNodeOp('n1'));
      await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      await vi.advanceTimersByTimeAsync(TOTAL_RETRY_BACKOFF_MS);
      vi.mocked(createCanvasNode).mockReset();
    });

    describe('WHEN retryFailed is called', () => {
      beforeEach(async () => {
        retryFailed();
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the operations are re-sent and saved', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 'n1' }));
        expect(getSaveState()).toMatchObject({ status: 'saved', failedCount: 0, pendingCount: 0 });
      });
    });

    describe('WHEN retryFailed is called while another flush is inflight', () => {
      let settleInflight: () => void;

      beforeEach(async () => {
        const deferred = Promise.withResolvers<void>();
        settleInflight = deferred.resolve;
        vi.mocked(createCanvasNode).mockReturnValueOnce(deferred.promise);
        enqueueOperation(createNodeOp('n2'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        retryFailed();
      });

      test('THEN the failed batch stays parked until the flush settles', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(1);
        expect(getSaveState()).toMatchObject({ failedCount: 1 });

        settleInflight();
      });
    });

    describe('WHEN discardFailed is called', () => {
      beforeEach(async () => {
        discardFailed();
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS * 4);
      });

      test('THEN nothing is re-sent', () => {
        expect(createCanvasNode).not.toHaveBeenCalled();
        expect(getSaveState()).toMatchObject({ status: 'saved', failedCount: 0 });
      });
    });

    describe('WHEN discardFailed is called with a fresh pending operation', () => {
      beforeEach(() => {
        enqueueOperation(createNodeOp('n2'));
        discardFailed();
      });

      test('THEN the queue starts saving only the pending operation', () => {
        expect(getSaveState()).toMatchObject({ status: 'saving', failedCount: 0, pendingCount: 1 });
      });
    });

    describe('WHEN the debounce window closes after a discard with a fresh pending operation', () => {
      beforeEach(async () => {
        enqueueOperation(createNodeOp('n2'));
        discardFailed();
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN only the pending operation is re-sent', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 'n2' }));
      });
    });

    describe('WHEN the browser reports connectivity restored', () => {
      beforeEach(async () => {
        window.dispatchEvent(new Event('online'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the failed operation is requeued and saved automatically', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 'n1' }));
        expect(getSaveState()).toMatchObject({ status: 'saved', failedCount: 0, pendingCount: 0 });
      });
    });
  });

  describe('GIVEN an idle queue with no failed operations', () => {
    describe('WHEN retryFailed is called', () => {
      beforeEach(() => {
        retryFailed();
      });

      test('THEN the save state does not change', () => {
        expect(getSaveState()).toMatchObject({ status: 'idle', failedCount: 0, pendingCount: 0 });
      });
    });
  });

  describe('GIVEN a saved queue with a save state subscriber', () => {
    beforeEach(async () => {
      enqueueOperation(createNodeOp('n1'));
      await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      unsubscribers.push(subscribeSaveState(onSaveState));
      onSaveState.mockClear();
    });

    describe('WHEN a duplicate online event arrives with nothing pending', () => {
      beforeEach(() => {
        window.dispatchEvent(new Event('online'));
      });

      test('THEN the listener is not notified again', () => {
        expect(onSaveState).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN pending operations while the browser is offline', () => {
    beforeEach(() => {
      enqueueOperation(createNodeOp('n1'));
      Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
      window.dispatchEvent(new Event('offline'));
      enqueueOperation(createNodeOp('n2'));
    });

    describe('WHEN the flush window passes', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS * 4);
      });

      test('THEN nothing is sent', () => {
        expect(createCanvasNode).not.toHaveBeenCalled();
      });

      test('THEN the queue stays offline with both operations pending', () => {
        expect(getSaveState()).toMatchObject({ status: 'offline', pendingCount: 2 });
      });
    });

    describe('WHEN the connection is restored', () => {
      beforeEach(async () => {
        Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
        window.dispatchEvent(new Event('online'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the held operations flush', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
      });

      test('THEN the state reports saved', () => {
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a flush attempt while the connection drops', () => {
    beforeEach(() => {
      vi.mocked(createCanvasNode).mockRejectedValueOnce(new Error('network'));
      enqueueOperation(createNodeOp('n1'));
      Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
    });

    describe('WHEN the flush window passes', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the queue goes offline keeping the operation pending', () => {
        expect(getSaveState()).toMatchObject({ status: 'offline', pendingCount: 1 });
      });
    });

    describe('WHEN the connection is restored after the failed attempt', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
        Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
        window.dispatchEvent(new Event('online'));
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the operation is recovered and saved', () => {
        expect(createCanvasNode).toHaveBeenCalledTimes(2);
        expect(getSaveState().status).toBe('saved');
      });
    });
  });

  describe('GIVEN a queue that went offline without a browser online event', () => {
    beforeEach(() => {
      enqueueOperation(createNodeOp('n1'));
      Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: false });
      window.dispatchEvent(new Event('offline'));
      Object.defineProperty(window.navigator, 'onLine', { configurable: true, value: true });
    });

    describe('WHEN the offline poll interval elapses', () => {
      beforeEach(async () => {
        await vi.advanceTimersByTimeAsync(OFFLINE_POLL_INTERVAL_MS);
        await vi.advanceTimersByTimeAsync(FLUSH_DEBOUNCE_MS);
      });

      test('THEN the queue recovers and flushes without an online event', () => {
        expect(createCanvasNode).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ id: 'n1' }));
        expect(getSaveState().status).toBe('saved');
      });
    });
  });
});
