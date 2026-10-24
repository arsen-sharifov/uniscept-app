import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode, StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { TTourStepKey } from '@interfaces';
import { EXAMPLE_CANVAS_TIMEOUT_MS } from '@constants';
import { stubAnimationFrame, stubResizeObserver } from '@mocks/browser';
import { THREAD_ID, questionNode } from '@mocks/canvas';
import { event } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { snapshot, EXAMPLE_CREATE_ERROR } from '@mocks/onboarding';
import { FULL_ACCESS } from '@mocks/roles';
import { ECanvasTool } from '@/components/tools';
import { ExampleRun } from '@/components/Tour';
import { EXAMPLE_GUIDE_ID, findGuide, useOnboardingStore } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const guide = findGuide(EXAMPLE_GUIDE_ID)!;
const lastIndex = guide.steps.length - 1;
const onCreateExample = vi.fn<(name: string) => Promise<string | null>>();
const onDeleteExample = vi.fn<(id: string) => Promise<void>>();

const indexOf = (copyKey: TTourStepKey) => guide.steps.findIndex((step) => step.copyKey === copyKey);

const threadStep = indexOf('exampleThread');
const capsuleStep = indexOf('exampleCapsule');

const exampleRun = (stepIndex: number) => (
  <ExampleRun
    guide={guide}
    stepIndex={stepIndex}
    snapshot={snapshot()}
    onCreateExample={onCreateExample}
    onDeleteExample={onDeleteExample}
  />
);

const button = (name: string) => screen.queryByRole('button', { name });

let observer: ReturnType<typeof stubResizeObserver>;
let rerender: (ui: ReactNode) => void;

beforeEach(() => {
  vi.useFakeTimers();
  stubAnimationFrame();
  observer = stubResizeObserver();
  vi.spyOn(HTMLDialogElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
  vi.spyOn(HTMLDialogElement.prototype, 'offsetHeight', 'get').mockReturnValue(220);
  usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
  onCreateExample.mockResolvedValue(THREAD_ID);
  onDeleteExample.mockResolvedValue();
});

afterEach(() => {
  useOnboardingStore.getState().forget();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('ExampleRun', () => {
  describe('GIVEN the scene that creates the example thread', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: threadStep } });
    });

    describe('WHEN it starts and the canvas is still on its way', () => {
      beforeEach(async () => {
        render(exampleRun(threadStep));
        act(() => observer.resize());
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the thread is created under the example name and next waits for it', () => {
        expect(onCreateExample).toHaveBeenCalledExactlyOnceWith(TRANSLATIONS.platform.onboarding.example.threadName);
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).toBeDisabled();
      });
    });

    describe('WHEN the canvas of the new thread opens', () => {
      beforeEach(async () => {
        render(exampleRun(threadStep));
        act(() => observer.resize());
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() =>
          useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} }),
        );
        await act(() => vi.runAllTimersAsync());
      });

      test('THEN the opener writes the question and next is offered', () => {
        expect(useCanvasStore.getState().nodes.at(0)?.data.label).toBe(
          TRANSLATIONS.platform.onboarding.example.question,
        );
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).toBeEnabled();
      });
    });

    describe('WHEN the thread cannot be created', () => {
      beforeEach(async () => {
        onCreateExample.mockResolvedValue(null);
        render(exampleRun(threadStep));
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the tour steps out', () => {
        expect(useOnboardingStore.getState().run).toBeNull();
      });
    });

    describe('WHEN the example closes while the thread is created and creation then fails', () => {
      beforeEach(async () => {
        const creation = Promise.withResolvers<string | null>();
        onCreateExample.mockReturnValue(creation.promise);
        render(exampleRun(threadStep));
        cleanup();
        creation.reject(EXAMPLE_CREATE_ERROR);
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the failure is only logged and the run is left to whoever closed it', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(EXAMPLE_CREATE_ERROR, {
          toast: false,
          context: 'onboarding.example',
        });
        expect(useOnboardingStore.getState().run).not.toBeNull();
      });
    });

    describe('WHEN the canvas never opens', () => {
      beforeEach(async () => {
        render(exampleRun(threadStep));
        await act(() => vi.advanceTimersByTimeAsync(EXAMPLE_CANVAS_TIMEOUT_MS));
      });

      test('THEN the failure is reported and the tour steps out', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.loadFailed,
          context: 'onboarding.example',
        });
        expect(useOnboardingStore.getState().run).toBeNull();
      });
    });
  });

  describe('GIVEN the example canvas is open', () => {
    beforeEach(async () => {
      useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: threadStep } });
      rerender = render(exampleRun(threadStep)).rerender;
      act(() => observer.resize());
      await act(() => vi.advanceTimersByTimeAsync(0));
      act(() =>
        useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} }),
      );
      await act(() => vi.runAllTimersAsync());
    });

    describe('WHEN the other user takes their turn', () => {
      beforeEach(async () => {
        useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: capsuleStep } });
        rerender(exampleRun(capsuleStep));
        await act(() => vi.runAllTimersAsync());
      });

      test('THEN their answer and the reason under it are placed, written and linked by themselves', () => {
        const { nodes, edges } = useCanvasStore.getState();

        expect(nodes.map((node) => node.data.label)).toEqual(
          expect.arrayContaining([
            TRANSLATIONS.platform.onboarding.example.nodes.capsule,
            TRANSLATIONS.platform.onboarding.example.nodes.oneButton,
          ]),
        );
        expect(edges).toHaveLength(2);
      });
    });

    describe('WHEN another thread is opened in the middle of a turn', () => {
      beforeEach(async () => {
        useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: capsuleStep } });
        rerender(exampleRun(capsuleStep));
        await act(() => vi.advanceTimersByTimeAsync(0));
        act(() =>
          useCanvasStore
            .getState()
            .loadCanvas('other-thread', { nodes: [questionNode('other-q')], edges: [], authors: {} }),
        );
        await act(() => vi.runAllTimersAsync());
      });

      test('THEN the tour steps out and nothing is written into the other thread', () => {
        const { threadId, nodes, edges } = useCanvasStore.getState();

        expect(useOnboardingStore.getState().run).toBeNull();
        expect({ threadId, nodeIds: nodes.map((node) => node.id), edges }).toEqual({
          threadId: 'other-thread',
          nodeIds: ['other-q'],
          edges: [],
        });
      });
    });

    describe('WHEN the example closes with a tool still picked and comments open', () => {
      beforeEach(() => {
        act(() => {
          useCanvasStore.getState().setActiveTool(ECanvasTool.AddNode);
          useCanvasStore.getState().setOpenCommentsNodeId('q');
        });
        cleanup();
      });

      test('THEN the tool is handed back and the comments panel is closed', () => {
        expect(useCanvasStore.getState()).toMatchObject({ activeTool: ECanvasTool.Select, openCommentsNodeId: null });
      });
    });

    describe('WHEN the last scene asks what to do with the example', () => {
      beforeEach(() => {
        useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: lastIndex } });
        rerender(exampleRun(lastIndex));
      });

      test('THEN it offers to keep or delete it instead of next', () => {
        expect(button(TRANSLATIONS.platform.onboarding.example.keep)).toBeInTheDocument();
        expect(button(TRANSLATIONS.platform.onboarding.example.remove)).toBeInTheDocument();
        expect(button(TRANSLATIONS.platform.onboarding.stepNext)).not.toBeInTheDocument();
      });
    });

    describe('WHEN the user keeps the example', () => {
      beforeEach(() => {
        useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: lastIndex } });
        rerender(exampleRun(lastIndex));
        fireEvent.click(button(TRANSLATIONS.platform.onboarding.example.keep)!);
      });

      test('THEN the guide finishes and the thread stays', () => {
        expect(useOnboardingStore.getState().completedGuides).toContain(EXAMPLE_GUIDE_ID);
        expect(onDeleteExample).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the user deletes the example and its canvas closes on the way', () => {
      beforeEach(async () => {
        onDeleteExample.mockImplementation(async () => useCanvasStore.getState().clearCanvas());
        useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: lastIndex } });
        rerender(exampleRun(lastIndex));
        fireEvent.click(button(TRANSLATIONS.platform.onboarding.example.remove)!);
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the example thread is deleted and the guide finishes', () => {
        expect(onDeleteExample).toHaveBeenCalledExactlyOnceWith(THREAD_ID);
        expect(useOnboardingStore.getState().completedGuides).toContain(EXAMPLE_GUIDE_ID);
      });
    });
  });

  describe('GIVEN the app renders in strict mode', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: threadStep } });
    });

    describe('WHEN the thread scene mounts and its effects run twice', () => {
      beforeEach(async () => {
        render(<StrictMode>{exampleRun(threadStep)}</StrictMode>);
        await act(() => vi.advanceTimersByTimeAsync(0));
      });

      test('THEN the example thread is still created only once', () => {
        expect(onCreateExample).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a running example', () => {
    beforeEach(() => {
      useOnboardingStore.setState({ run: { guideId: EXAMPLE_GUIDE_ID, stepIndex: indexOf('exampleIntro') } });
      render(exampleRun(indexOf('exampleIntro')));
    });

    describe('WHEN the user leaves it', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByTitle(TRANSLATIONS.platform.onboarding.quit));
      });

      test('THEN the run is dropped', () => {
        expect(useOnboardingStore.getState().run).toBeNull();
      });
    });
  });
});
