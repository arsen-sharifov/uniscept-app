import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IComment } from '@interfaces';

import { MIXED_COMMENT_THREAD, THREAD_ID, canvasNode } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import {
  BLANK_DRAFT_DOCUMENT,
  FORMATTED_DOCUMENT,
  FORMATTED_TEXT,
  PADDED_DRAFT_DOCUMENT,
  TYPED_DRAFT_DOCUMENT,
  editorOf,
  stubEditorLayout,
} from '@mocks/richText';
import { COMMENT_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { CommentsPanelContent } from '@/components/Canvas/fragments';
import { preloadRichTextEditor } from '@/components/RichTextEditor';
import { MAX_COMMENT_LENGTH } from '@/lib/canvas';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onDraftChange = vi.fn();

const storedComments = () =>
  useCanvasStore.getState().nodes.find((node) => node.id === 'n1')?.data.comments as IComment[] | undefined;

const composer = () => screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });

beforeAll(async () => {
  await preloadRichTextEditor();
});

beforeEach(() => {
  stubEditorLayout();
});

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('CommentsPanelContent', () => {
  describe('GIVEN a commenter reading a thread with their own and a formatted foreign comment', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      useCanvasStore
        .getState()
        .loadCanvas(THREAD_ID, { nodes: [canvasNode('n1', { comments: MIXED_COMMENT_THREAD })], edges: [] });
      useCanvasStore.getState().setOpenCommentsNodeId('n1');
      render(
        <CommentsPanelContent nodeId="n1" comments={MIXED_COMMENT_THREAD} draft={null} onDraftChange={onDraftChange} />,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
    });

    describe('WHEN the panel renders', () => {
      test('THEN both comments are listed under a counted header with delete offered only on their own', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.node.commentsHeader)).toHaveTextContent(
          `${TRANSLATIONS.platform.canvas.node.commentsHeader}2`,
        );
        expect(screen.getByText('Mine')).toBeInTheDocument();
        expect(screen.getByText('now').tagName).toBe('STRONG');
        expect(
          screen.getAllByRole('button', { name: TRANSLATIONS.platform.canvas.comments.deleteAriaLabel }),
        ).toHaveLength(1);
      });

      test('THEN the composer is empty, prompts for a comment and cannot send yet', () => {
        expect(composer()).toHaveTextContent(/^$/);
        expect(composer().querySelector('p')).toHaveAttribute(
          'data-placeholder',
          TRANSLATIONS.platform.canvas.node.addCommentPlaceholder,
        );
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.sendComment })).toBeDisabled();
      });

      test('THEN the list and the composer keep wheel and drag gestures away from the canvas', () => {
        expect(screen.getByText('Mine').closest('.nowheel')).toHaveClass('nopan');
        expect(composer().closest('.nowheel')).toHaveClass('nopan');
        expect(composer().closest('.nodrag')).toBeInTheDocument();
      });
    });

    describe('WHEN more text than the canvas stores is inserted', () => {
      beforeEach(() => {
        act(() => {
          editorOf(composer()).commands.insertContent('x'.repeat(MAX_COMMENT_LENGTH + 1));
        });
      });

      test('THEN the composer refuses the insertion', () => {
        expect(composer()).toHaveTextContent(/^$/);
      });
    });

    describe('WHEN they type into the composer', () => {
      beforeEach(() => {
        act(() => {
          editorOf(composer()).commands.insertContent('Draft');
        });
      });

      test('THEN the draft is handed to the owner and sending becomes possible', () => {
        expect(onDraftChange).toHaveBeenLastCalledWith(TYPED_DRAFT_DOCUMENT);
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.sendComment })).toBeEnabled();
      });
    });

    describe('WHEN they delete their own comment', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.comments.deleteAriaLabel }));
      });

      test('THEN only the foreign comment remains on the node', () => {
        expect(storedComments()?.map((entry) => entry.id)).toEqual(['c2']);
      });
    });

    describe('WHEN they close the panel', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.closeComments }));
      });

      test('THEN the node comments are no longer open', () => {
        expect(useCanvasStore.getState().openCommentsNodeId).toBeNull();
      });
    });
  });

  describe('GIVEN a commenter with a padded draft', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1')], edges: [] });
      render(
        <CommentsPanelContent nodeId="n1" comments={[]} draft={PADDED_DRAFT_DOCUMENT} onDraftChange={onDraftChange} />,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
    });

    describe('WHEN the draft is sent with the button', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.sendComment }));
      });

      test('THEN the trimmed comment is added and the composer is cleared', () => {
        expect(storedComments()).toEqual([expect.objectContaining({ text: 'Ship it', authorId: 'user-1' })]);
        expect(onDraftChange).toHaveBeenLastCalledWith(null);
        expect(composer()).toHaveTextContent(/^$/);
      });
    });
  });

  describe('GIVEN a commenter with a formatted draft', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1')], edges: [] });
      render(
        <CommentsPanelContent nodeId="n1" comments={[]} draft={FORMATTED_DOCUMENT} onDraftChange={onDraftChange} />,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
    });

    describe('WHEN the draft is sent with Enter', () => {
      beforeEach(() => {
        fireEvent.keyDown(composer(), { key: 'Enter' });
      });

      test('THEN the comment keeps its formatting', () => {
        expect(storedComments()).toEqual([
          expect.objectContaining({ text: FORMATTED_TEXT, richText: FORMATTED_DOCUMENT, authorId: 'user-1' }),
        ]);
      });
    });
  });

  describe('GIVEN a commenter with a blank draft', () => {
    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1')], edges: [] });
      render(
        <CommentsPanelContent nodeId="n1" comments={[]} draft={BLANK_DRAFT_DOCUMENT} onDraftChange={onDraftChange} />,
      );
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.addCommentPlaceholder });
    });

    describe('WHEN Enter is pressed anyway', () => {
      beforeEach(() => {
        fireEvent.keyDown(composer(), { key: 'Enter' });
      });

      test('THEN nothing is added and the draft is left alone', () => {
        expect(storedComments()).toEqual([]);
        expect(onDraftChange).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a node without comments', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', COMMENT_ACCESS);
    });

    describe('WHEN the panel renders', () => {
      beforeEach(() => {
        render(<CommentsPanelContent nodeId="n1" comments={[]} draft={null} onDraftChange={onDraftChange} />);
      });

      test('THEN the empty note shows and the header carries no count', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.node.noComments)).toBeInTheDocument();
        expect(screen.getByText(TRANSLATIONS.platform.canvas.node.commentsHeader)).toHaveTextContent(
          new RegExp(`^${TRANSLATIONS.platform.canvas.node.commentsHeader}$`),
        );
      });
    });
  });

  describe('GIVEN a viewer reading comments', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
    });

    describe('WHEN the panel renders', () => {
      beforeEach(() => {
        render(
          <CommentsPanelContent
            nodeId="n1"
            comments={MIXED_COMMENT_THREAD}
            draft={null}
            onDraftChange={onDraftChange}
          />,
        );
      });

      test('THEN the comments are readable without a composer or delete actions', () => {
        expect(screen.getByText('Mine')).toBeInTheDocument();
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.canvas.comments.deleteAriaLabel }),
        ).not.toBeInTheDocument();
      });
    });
  });
});
