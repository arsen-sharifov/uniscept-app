import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TExampleNodeKey, TExampleTarget } from '@interfaces';
import {
  EXAMPLE_CANVAS_TIMEOUT_MS,
  EXAMPLE_COMMENT_FIT_PADDING,
  EXAMPLE_FIT_PADDING,
  EXAMPLE_NODES,
  EXAMPLE_STEP_DELAY_MS,
} from '@constants';
import { THREAD_ID, questionNode } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { FULL_ACCESS } from '@mocks/roles';
import { ECanvasTool } from '@/components/tools';
import { createExampleIds, playExampleAct, waitForExampleCanvas, writeExampleQuestion } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

let ids: Record<TExampleTarget, string>;
let live: boolean;

const isLive = () => live;

const canvas = () => useCanvasStore.getState();

const nodeAt = (key: TExampleTarget) => canvas().nodes.find((node) => node.id === ids[key]);

const linksOf = () => canvas().edges.map(({ source, target }) => [source, target]);

beforeEach(() => {
  vi.useFakeTimers();
  live = true;
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
});

afterEach(() => {
  canvas().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  vi.useRealTimers();
});

describe('waitForExampleCanvas', () => {
  describe('GIVEN the example thread is still loading', () => {
    let questionId: Promise<string>;
    const released = vi.fn();

    beforeEach(() => {
      const subscribe = useCanvasStore.subscribe;
      vi.spyOn(useCanvasStore, 'subscribe').mockImplementation((listener) => {
        const unsubscribe = subscribe(listener);

        return () => {
          released();
          unsubscribe();
        };
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    describe('WHEN its canvas arrives', () => {
      beforeEach(() => {
        questionId = waitForExampleCanvas(THREAD_ID);
        canvas().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
      });

      test('THEN it resolves with the question node of that thread and stops listening', async () => {
        await expect(questionId).resolves.toBe('q');
        expect(released).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the canvas of another thread arrives first', () => {
      beforeEach(() => {
        questionId = waitForExampleCanvas(THREAD_ID);
        canvas().loadCanvas('another-thread', { nodes: [questionNode('elsewhere')], edges: [], authors: {} });
        canvas().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
      });

      test('THEN it keeps waiting and resolves with the question of the example thread', async () => {
        await expect(questionId).resolves.toBe('q');
        expect(released).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the canvas never arrives', () => {
      beforeEach(() => {
        questionId = waitForExampleCanvas(THREAD_ID);
        questionId.catch(() => null);
        vi.advanceTimersByTime(EXAMPLE_CANVAS_TIMEOUT_MS);
      });

      test('THEN it gives up with an error and stops listening', async () => {
        await expect(questionId).rejects.toThrow();
        expect(released).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN the example canvas is already open', () => {
    describe('WHEN it is awaited', () => {
      beforeEach(() => {
        canvas().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
      });

      test('THEN it resolves straight away', async () => {
        await expect(waitForExampleCanvas(THREAD_ID)).resolves.toBe('q');
      });
    });
  });
});

describe('createExampleIds', () => {
  describe('GIVEN the id of the question node', () => {
    describe('WHEN the example ids are drawn', () => {
      beforeEach(() => {
        ids = createExampleIds('q');
      });

      test('THEN the question keeps its id and every node gets a fresh one', () => {
        const nodeIds = Object.keys(EXAMPLE_NODES).map((key) => ids[key as TExampleNodeKey]);

        expect(ids.question).toBe('q');
        expect(new Set(nodeIds).size).toBe(nodeIds.length);
        expect(nodeIds).not.toContain('q');
      });
    });
  });
});

describe('writeExampleQuestion', () => {
  describe('GIVEN the fresh question of the example thread is open for editing', () => {
    beforeEach(() => {
      canvas().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
      ids = createExampleIds('q');
      canvas().setEditingNodeId('q');
    });

    describe('WHEN the opener writes it', () => {
      beforeEach(async () => {
        const written = writeExampleQuestion(TRANSLATIONS.platform.onboarding.example, ids, isLive);
        await vi.runAllTimersAsync();
        await written;
      });

      test('THEN the editor closes and the full question lands on the node', () => {
        expect(canvas().editingNodeId).toBeNull();
        expect(nodeAt('question')?.data.label).toBe(TRANSLATIONS.platform.onboarding.example.question);
      });
    });
  });
});

describe('playExampleAct', () => {
  beforeEach(() => {
    canvas().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
    ids = createExampleIds('q');
  });

  describe('GIVEN a speaker about to put forward an option', () => {
    describe('WHEN the move starts', () => {
      beforeEach(async () => {
        playExampleAct({ type: 'argue', keys: ['capsule'] }, TRANSLATIONS.platform.onboarding.example, ids, isLive);
        await vi.advanceTimersByTimeAsync(EXAMPLE_STEP_DELAY_MS);
      });

      test('THEN they pick Add node and drop a node that is still empty', () => {
        expect(canvas().activeTool).toBe(ECanvasTool.AddNode);
        expect(nodeAt('capsule')).toMatchObject({
          position: { x: EXAMPLE_NODES.capsule.x, y: EXAMPLE_NODES.capsule.y },
          data: { label: '' },
        });
      });
    });

    describe('WHEN the option and the reason for it are argued in one move', () => {
      beforeEach(async () => {
        const played = playExampleAct(
          { type: 'argue', keys: ['capsule', 'oneButton'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await played;
      });

      test('THEN both are written and each hangs from its planned parent', () => {
        expect([nodeAt('capsule')?.data.label, nodeAt('oneButton')?.data.label]).toEqual([
          TRANSLATIONS.platform.onboarding.example.nodes.capsule,
          TRANSLATIONS.platform.onboarding.example.nodes.oneButton,
        ]);
        expect(linksOf()).toEqual([
          ['q', ids.capsule],
          [ids.capsule, ids.oneButton],
        ]);
      });

      test('THEN the view is refitted above the card and the tool goes back to Select', () => {
        expect(canvas()).toMatchObject({ fitPadding: EXAMPLE_FIT_PADDING, activeTool: ECanvasTool.Select });
      });
    });

    describe('WHEN the user deletes the new option before it is linked', () => {
      beforeEach(async () => {
        const played = playExampleAct(
          { type: 'argue', keys: ['capsule'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.advanceTimersByTimeAsync(EXAMPLE_STEP_DELAY_MS * 3);
        canvas().deleteNode(ids.capsule);
        await vi.runAllTimersAsync();
        await played;
      });

      test('THEN no link is drawn to the missing node and the move still hands the tool back', () => {
        expect(canvas().edges).toEqual([]);
        expect(canvas().activeTool).toBe(ECanvasTool.Select);
      });
    });

    describe('WHEN the tour is left in the middle of the move', () => {
      beforeEach(async () => {
        const played = playExampleAct(
          { type: 'argue', keys: ['capsule', 'oneButton'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.advanceTimersByTimeAsync(EXAMPLE_STEP_DELAY_MS);
        live = false;
        await vi.runAllTimersAsync();
        await played;
      });

      test('THEN the move stops unlinked and leaves the tool for the tour to hand back', () => {
        expect(nodeAt('capsule')?.data.label).toBe('');
        expect(nodeAt('oneButton')).toBeUndefined();
        expect(canvas().edges).toEqual([]);
        expect(canvas().activeTool).toBe(ECanvasTool.AddNode);
      });
    });
  });

  describe('GIVEN two competing options on the canvas', () => {
    beforeEach(async () => {
      const firstOption = playExampleAct(
        { type: 'argue', keys: ['capsule', 'oneButton'] },
        TRANSLATIONS.platform.onboarding.example,
        ids,
        isLive,
      );
      await vi.runAllTimersAsync();
      await firstOption;
      const secondOption = playExampleAct(
        { type: 'argue', keys: ['bean', 'perCup'] },
        TRANSLATIONS.platform.onboarding.example,
        ids,
        isLive,
      );
      await vi.runAllTimersAsync();
      await secondOption;
    });

    describe('WHEN one speaker doubts the other option', () => {
      beforeEach(async () => {
        const commented = playExampleAct(
          { type: 'comment', key: 'bean' },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await commented;
      });

      test('THEN the doubt is left as a comment on that option with its panel still open', () => {
        expect(nodeAt('bean')?.data.comments).toEqual([
          expect.objectContaining({ text: TRANSLATIONS.platform.onboarding.example.comments.bean }),
        ]);
        expect(canvas()).toMatchObject({ openCommentsNodeId: ids.bean, fitPadding: EXAMPLE_COMMENT_FIT_PADDING });
      });
    });

    describe('WHEN the doubt is answered with a second reason', () => {
      beforeEach(async () => {
        const answered = playExampleAct(
          { type: 'argue', keys: ['payback'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await answered;
      });

      test('THEN the reason hangs from the option it defends', () => {
        expect(canvas().edges.find(({ target }) => target === ids.payback)?.source).toBe(ids.bean);
      });
    });

    describe('WHEN one option is ruled out and the other is chosen', () => {
      beforeEach(async () => {
        const commented = playExampleAct(
          { type: 'comment', key: 'capsule' },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await commented;
        const ruledOut = playExampleAct(
          { type: 'status', status: 'invalid', keys: ['capsule'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await ruledOut;
        const chosen = playExampleAct(
          { type: 'status', status: 'valid', keys: ['bean', 'perCup'] },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await chosen;
        const answerSet = playExampleAct(
          { type: 'answer', key: 'bean' },
          TRANSLATIONS.platform.onboarding.example,
          ids,
          isLive,
        );
        await vi.runAllTimersAsync();
        await answerSet;
      });

      test('THEN each verdict lands where the script says and the answer is set', () => {
        expect(nodeAt('capsule')?.data.status).toBe('invalid');
        expect([nodeAt('bean')?.data.status, nodeAt('perCup')?.data.status]).toEqual(['valid', 'valid']);
        expect(nodeAt('bean')?.data.isAnswer).toBe(true);
      });

      test('THEN picking the next tool closed the comments panel', () => {
        expect(canvas().openCommentsNodeId).toBeNull();
      });
    });
  });
});
