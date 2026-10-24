import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { listenOnPage, stubResizeObserver } from '@mocks/browser';
import {
  CANVAS_AUTHORS,
  THREAD_ID,
  canvasEdge,
  canvasNode,
  comment,
  editedForeignNode,
  nodeProps,
} from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import {
  FORMATTED_DOCUMENT,
  FORMATTED_TEXT,
  TRAILING_SPACE_DOCUMENT,
  editorOf,
  stubEditorLayout,
} from '@mocks/richText';
import { COMMENT_ACCESS, FULL_ACCESS } from '@mocks/roles';
import { NODE_ALARM_WASHES } from '@/components/Canvas/consts';
import { CanvasNode } from '@/components/Canvas/fragments';
import { preloadRichTextEditor } from '@/components/RichTextEditor';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onPageClick = vi.fn();
const onPagePress = vi.fn();

const nodeCard = () => document.querySelector<HTMLElement>('[data-tour="canvasNode"]');
const commentsPanel = () => document.querySelector<HTMLElement>('[data-tour="canvasCommentsPanel"]');

beforeAll(async () => {
  await preloadRichTextEditor();
});

beforeEach(() => {
  stubResizeObserver();
  stubEditorLayout();
  listenOnPage({ click: onPageClick, mousedown: onPagePress });
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('CanvasNode', () => {
  describe('GIVEN a node a member wrote last year and edited since', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore
        .getState()
        .loadCanvas(THREAD_ID, { nodes: [editedForeignNode('n1')], edges: [], authors: CANVAS_AUTHORS });
    });

    describe('WHEN the node renders', () => {
      beforeEach(() => {
        render(
          <ReactFlowProvider>
            <CanvasNode {...nodeProps(editedForeignNode('n1'))} />
          </ReactFlowProvider>,
        );
      });

      test('THEN the author, the date and the edit label show under the text', () => {
        expect(screen.getByText('Ilya M.')).toBeInTheDocument();
        expect(screen.getByText('Mar 1, 2025')).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.canvas.authorship.edited)).toBeInTheDocument();
      });
    });
  });

  describe("GIVEN the workspace owner with someone else's node open for editing", () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore
        .getState()
        .loadCanvas(THREAD_ID, { nodes: [editedForeignNode('n1')], edges: [], authors: CANVAS_AUTHORS });
      useCanvasStore.getState().setEditingNodeId('n1');
    });

    describe('WHEN the node renders', () => {
      beforeEach(async () => {
        render(
          <ReactFlowProvider>
            <CanvasNode {...nodeProps(editedForeignNode('n1'))} />
          </ReactFlowProvider>,
        );
        await act(async () => {
          await preloadRichTextEditor();
        });
      });

      test('THEN no textbox renders and the text stays read-only', () => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText('Node n1')).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN an invalid node linked into the graph', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { status: 'invalid', createdBy: 'user-1' }), canvasNode('n2')],
        edges: [canvasEdge('e1', 'n1', 'n2')],
        authors: {},
      });
    });

    describe('WHEN the node renders at rest', () => {
      beforeEach(() => {
        render(
          <ReactFlowProvider>
            <CanvasNode {...nodeProps(canvasNode('n1', { status: 'invalid', createdBy: 'user-1' }), true)} />
          </ReactFlowProvider>,
        );
      });

      test('THEN it carries the invalid band, the alarm wash and the tour markers', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.node.invalidBadge)).toBeInTheDocument();
        expect(nodeCard()).toHaveStyle({
          backgroundImage: `linear-gradient(${NODE_ALARM_WASHES.invalid}, ${NODE_ALARM_WASHES.invalid})`,
        });
        expect(nodeCard()).toHaveAttribute('data-tour-state', 'invalid');
        expect(nodeCard()).toHaveAttribute('data-tour-linked', 'true');
        expect(nodeCard()).toHaveClass('ring-[color:var(--selection)]');
      });
    });

    describe('WHEN the node is being edited', () => {
      beforeEach(async () => {
        useCanvasStore.getState().setEditingNodeId('n1');
        render(
          <ReactFlowProvider>
            <CanvasNode {...nodeProps(canvasNode('n1', { status: 'invalid', createdBy: 'user-1' }))} />
          </ReactFlowProvider>,
        );
        await screen.findByRole('textbox');
      });

      test('THEN the wash lifts and the label turns into an editor', () => {
        expect(nodeCard()).not.toHaveAttribute('style');
        expect(nodeCard()).toHaveClass('border-[color:var(--border-active)]');
        expect(screen.getByRole('textbox')).toHaveTextContent('Node n1');
      });
    });
  });

  describe('GIVEN a freshly dropped node that is eligible for the active tool', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { isNew: true, eligibleHint: true })],
        edges: [],
        authors: {},
      });
      render(
        <ReactFlowProvider>
          <CanvasNode {...nodeProps(canvasNode('n1', { isNew: true, eligibleHint: true }))} />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN it plays the drop animation inside the eligibility halo without any band', () => {
        expect(nodeCard()).toHaveClass('animate-node-drop');
        expect(nodeCard()?.querySelector('[aria-hidden].border-dashed')).toBeInTheDocument();
        expect(nodeCard()).toHaveAttribute('data-tour-state', 'unmarked');
        expect(nodeCard()).toHaveAttribute('data-tour-linked', 'false');
      });
    });
  });

  describe('GIVEN a commenter with the node comments open', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [canvasNode('n1', { comments: [comment('c1')] })],
        edges: [],
        authors: {},
      });
      useCanvasStore.getState().setOpenCommentsNodeId('n1');
      render(
        <ReactFlowProvider>
          <CanvasNode {...nodeProps(canvasNode('n1', { comments: [comment('c1')] }))} />
        </ReactFlowProvider>,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
    });

    describe('WHEN the panel renders', () => {
      test('THEN it sits beside the card, keeps keys and drags away from the canvas and is left out of exports', () => {
        expect(commentsPanel()).toHaveClass('nodrag', 'nokey', 'left-full');
        expect(commentsPanel()).toHaveAttribute('data-export-omit');
        expect(screen.getByText('Comment c1')).toBeInTheDocument();
      });
    });

    describe('WHEN something inside the panel is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Comment c1'));
      });

      test('THEN the click stays inside the panel and the comments stay open', () => {
        expect(onPageClick).not.toHaveBeenCalled();
        expect(useCanvasStore.getState().openCommentsNodeId).toBe('n1');
      });
    });

    describe('WHEN the pointer goes down inside the panel', () => {
      beforeEach(() => {
        fireEvent.mouseDown(screen.getByText('Comment c1'));
      });

      test('THEN the press stays inside the panel', () => {
        expect(onPagePress).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the card label is clicked', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByText('Node n1'));
      });

      test('THEN the click reaches the canvas like any node click', () => {
        expect(onPageClick).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN a draft ending in a space is typed and the panel is closed and reopened', () => {
      beforeEach(async () => {
        act(() => {
          editorOf(
            screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder }),
          ).commands.setContent(TRAILING_SPACE_DOCUMENT, { emitUpdate: true });
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.closeComments }));
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.viewComments }));
        await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
      });

      test('THEN the trailing space survives so typing can continue the sentence', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder }),
        ).toHaveTextContent('Check the ', { normalizeWhitespace: false });
      });
    });

    describe('WHEN a formatted draft is typed and the panel is closed and reopened', () => {
      beforeEach(async () => {
        act(() => {
          editorOf(
            screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder }),
          ).commands.setContent(FORMATTED_DOCUMENT, { emitUpdate: true });
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.closeComments }));
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.viewComments }));
        await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
      });

      test('THEN the draft and its formatting are still in the composer', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder }),
        ).toHaveTextContent(FORMATTED_TEXT);
        expect(screen.getByText('now').tagName).toBe('STRONG');
      });
    });

    describe('WHEN their comment is retyped in the editor and the panel is closed and reopened', () => {
      beforeEach(async () => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.comments.editAriaLabel }));
        const editor = await screen.findByRole('textbox', {
          name: TRANSLATIONS.platform.canvas.comments.editorAriaLabel,
        });
        act(() => {
          editorOf(editor).commands.setContent(TRAILING_SPACE_DOCUMENT, { emitUpdate: true });
        });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.closeComments }));
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.viewComments }));
        await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.comments.editorAriaLabel });
      });

      test('THEN the edit is still open with the unfinished text', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.comments.editorAriaLabel }),
        ).toHaveTextContent('Check the ', { normalizeWhitespace: false });
      });
    });

    describe('WHEN their comment is opened for editing from the keyboard and saved', () => {
      beforeEach(async () => {
        const editButton = screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.comments.editAriaLabel });
        editButton.focus();
        fireEvent.click(editButton);
        fireEvent.keyDown(
          await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.comments.editorAriaLabel }),
          { key: 'Enter' },
        );
      });

      test('THEN the editor closes and focus goes back to the edit button', () => {
        expect(
          screen.queryByRole('textbox', { name: TRANSLATIONS.platform.canvas.comments.editorAriaLabel }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.comments.editAriaLabel })).toHaveFocus();
      });
    });
  });
});
