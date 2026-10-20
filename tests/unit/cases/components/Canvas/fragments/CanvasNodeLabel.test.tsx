import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { listenOnPage, stubResizeObserver } from '@mocks/browser';
import { THREAD_ID, canvasNode, overflowLabels, resetLabelOverflow } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { FORMATTED_DOCUMENT, FORMATTED_TEXT, editorOf, stubEditorLayout } from '@mocks/richText';
import { FULL_ACCESS, READONLY_ACCESS } from '@mocks/roles';
import { CanvasNodeLabel } from '@/components/Canvas/fragments';
import { preloadRichTextEditor } from '@/components/RichTextEditor';
import { MAX_NODE_LABEL_LENGTH } from '@/lib/canvas';
import { useOnboardingStore } from '@/lib/onboarding';
import { useCanvasStore, usePermissionsStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onPageClick = vi.fn();
const onPagePress = vi.fn();

beforeAll(async () => {
  await preloadRichTextEditor();
});

beforeEach(() => {
  stubResizeObserver();
  stubEditorLayout();
  listenOnPage({ click: onPageClick, mousedown: onPagePress });
});

afterEach(() => {
  resetLabelOverflow();
  useOnboardingStore.getState().forget();
  useCanvasStore.getState().clearCanvas();
  usePermissionsStore.getState().clearAccess();
});

describe('CanvasNodeLabel', () => {
  describe('GIVEN a long label an owner is not editing', () => {
    beforeEach(() => {
      overflowLabels();
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      render(<CanvasNodeLabel id="n1" label="A long idea" isEditing={false} measured commentCount={0} />);
    });

    describe('WHEN the label renders', () => {
      test('THEN it is clamped with the comment invite and a show more toggle beside it', () => {
        expect(screen.getByText('A long idea')).toHaveClass('line-clamp-10');
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.addComment })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showMore })).toBeInTheDocument();
      });
    });

    describe('WHEN the label is expanded', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showMore }));
      });

      test('THEN the clamp lifts and the toggle offers to show less', () => {
        expect(screen.getByText('A long idea')).not.toHaveClass('line-clamp-10');
        expect(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.node.showLess })).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a short label a viewer is reading', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
    });

    describe('WHEN the label renders', () => {
      beforeEach(() => {
        render(<CanvasNodeLabel id="n1" label="Short" isEditing={false} measured commentCount={0} />);
      });

      test('THEN neither the toggle nor the comment invite is shown', () => {
        expect(screen.getByText('Short')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a formatted label a viewer is reading', () => {
    beforeEach(() => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', READONLY_ACCESS);
    });

    describe('WHEN the label renders', () => {
      beforeEach(() => {
        render(
          <CanvasNodeLabel
            id="n1"
            label={FORMATTED_TEXT}
            richLabel={FORMATTED_DOCUMENT}
            isEditing={false}
            measured
            commentCount={0}
          />,
        );
      });

      test('THEN the formatting shows inside the clamped label', () => {
        expect(screen.getByText('now').tagName).toBe('STRONG');
        expect(screen.getByText('now').closest('[data-rich-text]')).toHaveClass('line-clamp-10');
      });
    });
  });

  describe('GIVEN an owner editing the label while a guide is running', () => {
    beforeEach(async () => {
      overflowLabels();
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1', { label: 'Idea' })], edges: [] });
      useCanvasStore.getState().setEditingNodeId('n1');
      useOnboardingStore.getState().startGuide('canvas');
      render(<CanvasNodeLabel id="n1" label="Idea" isEditing measured commentCount={2} />);
      await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.labelAriaLabel });
    });

    describe('WHEN the editor opens', () => {
      test('THEN a focused, labelled editor replaces the label without the side buttons', async () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.node.labelAriaLabel }),
        ).toHaveTextContent('Idea');
        await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
      });
    });

    describe('WHEN more text than the canvas stores is inserted', () => {
      beforeEach(() => {
        act(() => {
          editorOf(screen.getByRole('textbox')).commands.insertContent('x'.repeat(MAX_NODE_LABEL_LENGTH));
        });
      });

      test('THEN the editor refuses the insertion', () => {
        expect(screen.getByRole('textbox')).toHaveTextContent(/^Idea$/);
      });
    });

    describe('WHEN the editor is clicked and pressed', () => {
      beforeEach(() => {
        fireEvent.mouseDown(screen.getByRole('textbox'));
        fireEvent.click(screen.getByRole('textbox'));
      });

      test('THEN neither reaches the canvas and editing continues', () => {
        expect(onPageClick).not.toHaveBeenCalled();
        expect(onPagePress).not.toHaveBeenCalled();
        expect(useCanvasStore.getState().editingNodeId).toBe('n1');
      });
    });

    describe('WHEN a formatted label is written and focus leaves the editor', () => {
      beforeEach(() => {
        act(() => {
          editorOf(screen.getByRole('textbox')).commands.setContent(FORMATTED_DOCUMENT);
        });
        fireEvent.blur(screen.getByRole('textbox'));
      });

      test('THEN the label and its formatting are saved and the guide learns the node was labelled', () => {
        expect(useCanvasStore.getState().nodes[0]?.data.label).toBe(FORMATTED_TEXT);
        expect(useCanvasStore.getState().nodes[0]?.data.richLabel).toEqual(FORMATTED_DOCUMENT);
        expect(useOnboardingStore.getState().signals.has('nodeLabelled')).toBe(true);
      });
    });

    describe('WHEN the same label is committed', () => {
      beforeEach(() => {
        fireEvent.blur(screen.getByRole('textbox'));
      });

      test('THEN the guide is not told about a relabel', () => {
        expect(useOnboardingStore.getState().signals.has('nodeLabelled')).toBe(false);
      });
    });
  });

  describe('GIVEN an owner editing the label of a node React Flow has not measured yet', () => {
    let rerender: ReturnType<typeof render>['rerender'];

    beforeEach(async () => {
      usePermissionsStore.getState().setAccess('ws-1', 'user-1', FULL_ACCESS);
      useCanvasStore.getState().loadCanvas(THREAD_ID, { nodes: [canvasNode('n1', { label: 'Idea' })], edges: [] });
      useCanvasStore.getState().setEditingNodeId('n1');
      rerender = render(<CanvasNodeLabel id="n1" label="Idea" isEditing measured={false} commentCount={0} />).rerender;
      await screen.findByRole('textbox');
    });

    describe('WHEN the editor opens on the hidden node', () => {
      test('THEN the editor waits without taking focus', () => {
        expect(screen.getByRole('textbox')).not.toHaveFocus();
      });
    });

    describe('WHEN the node is measured and shown', () => {
      beforeEach(() => {
        rerender(<CanvasNodeLabel id="n1" label="Idea" isEditing measured commentCount={0} />);
      });

      test('THEN the editor takes focus', async () => {
        await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
      });
    });
  });
});
