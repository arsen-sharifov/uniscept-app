import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubResizeObserver } from '@mocks/browser';
import {
  CANVAS_AUTHORS,
  THREAD_ID,
  foreignQuestionNode,
  formattedQuestionNode,
  nodeProps,
  overflowLabels,
  questionNode,
  resetLabelOverflow,
  writtenQuestionNode,
} from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { editorOf, stubEditorLayout } from '@mocks/richText';
import { FULL_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { QuestionNode } from '@/components/Canvas/fragments';
import { preloadRichTextEditor } from '@/components/RichTextEditor';
import { MAX_NODE_LABEL_LENGTH, subscribeCanvasOperations } from '@/lib/canvas';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onOperation = vi.fn();

const unsubscribers: Array<() => void> = [];

beforeAll(async () => {
  await preloadRichTextEditor();
});

beforeEach(() => {
  stubResizeObserver();
  stubEditorLayout();
});

afterEach(() => {
  unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
  resetLabelOverflow();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('QuestionNode', () => {
  describe('GIVEN a question the thread creator wrote last year', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      useCanvasStore
        .getState()
        .loadCanvas(THREAD_ID, { nodes: [writtenQuestionNode('q')], edges: [], authors: CANVAS_AUTHORS });
    });

    describe('WHEN a viewer reads it', () => {
      beforeEach(() => {
        render(
          <ReactFlowProvider>
            <QuestionNode {...nodeProps(writtenQuestionNode('q'))} />
          </ReactFlowProvider>,
        );
      });

      test('THEN its author and date show under the question', () => {
        expect(screen.getByText(CANVAS_AUTHORS['user-1'].name)).toBeInTheDocument();
        expect(screen.getByText('Mar 1, 2025')).toBeInTheDocument();
      });
    });
  });

  describe("GIVEN the workspace owner with someone else's question open for editing", () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [foreignQuestionNode('q')], edges: [], authors: {} });
      useCanvasStore.getState().setEditingNodeId('q');
    });

    describe('WHEN the question renders', () => {
      beforeEach(async () => {
        render(
          <ReactFlowProvider>
            <QuestionNode {...nodeProps(foreignQuestionNode('q'))} />
          </ReactFlowProvider>,
        );
        await act(async () => {
          await preloadRichTextEditor();
        });
      });

      test('THEN no textbox renders and the question stays read-only', () => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Main question')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a long question a viewer has selected', () => {
    beforeEach(() => {
      overflowLabels();
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      render(
        <ReactFlowProvider>
          <QuestionNode {...nodeProps(questionNode('q'), true)} />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the clamped question shows under its band with a show more toggle', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.question.badge)).toBeInTheDocument();
        expect(screen.getByText('Main question')).toHaveClass('line-clamp-8', 'text-[color:var(--text-strong)]');
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showMore })).toBeInTheDocument();
      });
    });

    describe('WHEN the question is expanded', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showMore }));
      });

      test('THEN the clamp lifts and the toggle offers to show less', () => {
        expect(screen.getByText('Main question')).not.toHaveClass('line-clamp-8');
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showLess })).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a question without text', () => {
    beforeEach(() => {
      overflowLabels();
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
    });

    describe('WHEN it renders', () => {
      beforeEach(() => {
        render(
          <ReactFlowProvider>
            <QuestionNode {...nodeProps(questionNode('q', '  '))} />
          </ReactFlowProvider>,
        );
      });

      test('THEN the muted placeholder shows without a clamp or a toggle', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.question.placeholder)).toHaveClass(
          'text-[color:var(--text-subtle)]',
        );
        expect(screen.getByText(TRANSLATIONS.platform.canvas.question.placeholder)).not.toHaveClass('line-clamp-8');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a formatted question a viewer is reading', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
      render(
        <ReactFlowProvider>
          <QuestionNode {...nodeProps(formattedQuestionNode('q'))} />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the formatting shows in the question', () => {
        expect(screen.getByText('now').tagName).toBe('STRONG');
      });
    });
  });

  describe('GIVEN the author editing the question', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [questionNode('q')], edges: [], authors: {} });
      useCanvasStore.getState().setEditingNodeId('q');
      render(
        <ReactFlowProvider>
          <QuestionNode {...nodeProps(questionNode('q'))} />
        </ReactFlowProvider>,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.question.ariaLabel });
    });

    describe('WHEN the editor opens', () => {
      test('THEN a focused, labelled editor replaces the question', async () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.question.ariaLabel }),
        ).toHaveTextContent('Main question');
        await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
      });
    });

    describe('WHEN more text than the canvas stores is inserted', () => {
      beforeEach(() => {
        act(() => {
          editorOf(screen.getByRole('textbox')).commands.insertContent('x'.repeat(MAX_NODE_LABEL_LENGTH));
        });
      });

      test('THEN the editor refuses the insertion', () => {
        expect(screen.getByRole('textbox')).toHaveTextContent(/^Main question$/);
      });
    });

    describe('WHEN a new question is committed with Enter', () => {
      beforeEach(() => {
        act(() => {
          editorOf(screen.getByRole('textbox')).commands.setContent('<p>Which bet wins?</p>');
        });
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      });

      test('THEN the question is saved and editing ends', () => {
        expect(useCanvasStore.getState().nodes[0]?.data.label).toBe('Which bet wins?');
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
      });
    });

    describe('WHEN the edit is cancelled with Escape', () => {
      beforeEach(() => {
        act(() => {
          editorOf(screen.getByRole('textbox')).commands.setContent('<p>Discarded draft</p>');
        });
        fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
      });

      test('THEN the question keeps its text and editing ends', () => {
        expect(useCanvasStore.getState().nodes[0]?.data.label).toBe('Main question');
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
      });
    });
  });

  describe('GIVEN the author opening an empty question for editing', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [questionNode('q', '')], edges: [], authors: {} });
      useCanvasStore.getState().setEditingNodeId('q');
      render(
        <ReactFlowProvider>
          <QuestionNode {...nodeProps(questionNode('q', ''))} />
        </ReactFlowProvider>,
      );
      await screen.findByRole('textbox');
    });

    describe('WHEN the editor opens', () => {
      test('THEN the question prompt shows as the placeholder', () => {
        expect(screen.getByRole('textbox').querySelector('p')).toHaveAttribute(
          'data-placeholder',
          TRANSLATIONS.platform.canvas.question.placeholder,
        );
      });
    });
  });

  describe('GIVEN a fresh question opened for editing before React Flow measured it', () => {
    let rerender: ReturnType<typeof render>['rerender'];

    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [questionNode('q', '  ')], edges: [], authors: {} });
      useCanvasStore.getState().setEditingNodeId('q');
      unsubscribers.push(subscribeCanvasOperations(onOperation));
      rerender = render(
        <ReactFlowProvider>
          <QuestionNode {...nodeProps(questionNode('q', '  '))} width={0} height={0} />
        </ReactFlowProvider>,
      ).rerender;
      await screen.findByRole('textbox');
    });

    describe('WHEN the hidden node renders its editor', () => {
      test('THEN the editor is in place but not focused yet', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.question.ariaLabel }),
        ).not.toHaveFocus();
      });
    });

    describe('WHEN React Flow measures and reveals the node', () => {
      beforeEach(() => {
        rerender(
          <ReactFlowProvider>
            <QuestionNode {...nodeProps(questionNode('q', '  '))} />
          </ReactFlowProvider>,
        );
      });

      test('THEN the editor takes focus so typing goes into the question', async () => {
        await waitFor(() =>
          expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.question.ariaLabel })).toHaveFocus(),
        );
      });
    });

    describe('WHEN it blurs without any text', () => {
      beforeEach(() => {
        fireEvent.blur(screen.getByRole('textbox'));
      });

      test('THEN editing ends without writing the unchanged label', () => {
        expect(useCanvasStore.getState().editingNodeId).toBeNull();
        expect(onOperation).not.toHaveBeenCalled();
      });
    });
  });
});
