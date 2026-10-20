import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { listenOnPage } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import {
  EMPTY_PARAGRAPH_DOCUMENT,
  FORMATTED_DOCUMENT,
  FORMATTED_TEXT,
  LIST_HTML,
  PLAIN_TEXT,
  PREFIXED_FORMATTED_DOCUMENT,
  editorOf,
  stubEditorLayout,
} from '@mocks/richText';
import { EditorSurface } from '@/components/RichTextEditor/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onSubmit = vi.fn();
const onChange = vi.fn();
const onCancel = vi.fn();
const onLeave = vi.fn();
const onPageContextMenu = vi.fn();

const editorBox = () => screen.getByRole('textbox', { name: 'Draft' });
const toolbarHost = () => document.querySelector<HTMLElement>('[data-rich-text-toolbar]');

beforeEach(() => {
  stubEditorLayout();
  listenOnPage({ contextmenu: onPageContextMenu });
});

describe('EditorSurface', () => {
  describe('GIVEN legacy text opened for editing', () => {
    beforeEach(() => {
      render(
        <EditorSurface
          text={PLAIN_TEXT}
          ariaLabel="Draft"
          placeholder="Write here"
          maxLength={100}
          className="text-[13px]"
          onSubmit={onSubmit}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN every line becomes a paragraph in a labelled multi-line textbox that does not take focus', () => {
        expect(editorBox().querySelectorAll('p')).toHaveLength(3);
        expect(editorBox()).toHaveAttribute('aria-multiline', 'true');
        expect(editorBox()).toHaveClass('rich-text', 'rich-text-editor', 'text-[13px]');
        expect(editorBox()).not.toHaveFocus();
        expect(toolbarHost()?.parentElement).toBe(document.body);
      });
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
      });

      test('THEN the plain text is submitted', () => {
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ text: PLAIN_TEXT });
      });
    });

    describe('WHEN the editor is right clicked', () => {
      beforeEach(() => {
        fireEvent.contextMenu(editorBox());
      });

      test('THEN the canvas never sees the context menu request', () => {
        expect(onPageContextMenu).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Escape is pressed without a cancel handler', () => {
      let escapeAllowed: boolean;

      beforeEach(() => {
        escapeAllowed = fireEvent.keyDown(editorBox(), { key: 'Escape' });
      });

      test('THEN the key is left to the page', () => {
        expect(escapeAllowed).toBe(true);
      });
    });

    describe('WHEN focus leaves without a leave handler', () => {
      beforeEach(() => {
        fireEvent.blur(editorBox());
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
      });

      test('THEN the editor stays usable', () => {
        expect(onSubmit).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a formatted label edited with every handler', () => {
    beforeEach(() => {
      render(
        <EditorSurface
          text={FORMATTED_TEXT}
          document={FORMATTED_DOCUMENT}
          ariaLabel="Draft"
          maxLength={100}
          onSubmit={onSubmit}
          onChange={onChange}
          onCancel={onCancel}
          onLeave={onLeave}
        />,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the stored formatting is restored', () => {
        expect(screen.getByText('now').tagName).toBe('STRONG');
      });
    });

    describe('WHEN the content changes', () => {
      beforeEach(() => {
        act(() => {
          editorOf(editorBox()).commands.insertContentAt(1, 'Do ');
        });
      });

      test('THEN the owner gets the untrimmed document with its formatting', () => {
        expect(onChange).toHaveBeenLastCalledWith(PREFIXED_FORMATTED_DOCUMENT);
      });
    });

    describe('WHEN focus leaves for the page', () => {
      beforeEach(() => {
        fireEvent.blur(editorBox());
      });

      test('THEN the value is handed over once as the user leaves', () => {
        expect(onLeave).toHaveBeenCalledExactlyOnceWith({ text: FORMATTED_TEXT, document: FORMATTED_DOCUMENT });
      });
    });

    describe('WHEN focus moves into the formatting toolbar', () => {
      beforeEach(() => {
        const field = document.createElement('input');
        toolbarHost()?.append(field);
        fireEvent.blur(editorBox(), { relatedTarget: field });
      });

      test('THEN editing continues', () => {
        expect(onLeave).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Escape is pressed and focus then leaves', () => {
      beforeEach(() => {
        fireEvent.keyDown(editorBox(), { key: 'Escape' });
        fireEvent.keyDown(editorBox(), { key: 'Escape' });
        fireEvent.blur(editorBox());
      });

      test('THEN only the cancel is reported', () => {
        expect(onCancel).toHaveBeenCalledOnce();
        expect(onLeave).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Enter is pressed and focus then leaves', () => {
      beforeEach(() => {
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
        fireEvent.blur(editorBox());
      });

      test('THEN only the submit is reported', () => {
        expect(onSubmit).toHaveBeenCalledOnce();
        expect(onLeave).not.toHaveBeenCalled();
      });
    });

    describe('WHEN Mod-k is pressed with only a caret in plain text', () => {
      let shortcutAllowed: boolean;

      beforeEach(() => {
        act(() => {
          editorOf(editorBox()).commands.setTextSelection(2);
        });
        shortcutAllowed = fireEvent.keyDown(editorBox(), { key: 'k', ctrlKey: true });
      });

      test('THEN there is nothing to link and the key is left alone', () => {
        expect(shortcutAllowed).toBe(true);
      });
    });
  });

  describe('GIVEN a focused editor with a word selected', () => {
    beforeEach(async () => {
      render(
        <EditorSurface
          text="Pick this word"
          ariaLabel="Draft"
          maxLength={100}
          autoFocus
          onSubmit={onSubmit}
          onLeave={onLeave}
        />,
      );
      await vi.waitUntil(() => document.activeElement === editorBox());
      act(() => {
        editorOf(editorBox()).commands.setTextSelection({ from: 6, to: 10 });
      });
      await screen.findByRole('toolbar', { name: TRANSLATIONS.platform.canvas.formatting.toolbar });
    });

    describe('WHEN Mod-k is pressed', () => {
      beforeEach(async () => {
        fireEvent.keyDown(editorBox(), { key: 'k', ctrlKey: true });
        await screen.findByRole('textbox', { name: TRANSLATIONS.platform.canvas.formatting.linkAddress });
      });

      test('THEN the toolbar opens the link form and focus moving there does not end editing', () => {
        expect(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.formatting.linkAddress }),
        ).toHaveFocus();
        expect(onLeave).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the toolbar loses focus to the page', () => {
      beforeEach(() => {
        fireEvent.blur(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.bold }));
      });

      test('THEN editing ends with the current value', () => {
        expect(onLeave).toHaveBeenCalledExactlyOnceWith({ text: 'Pick this word' });
      });
    });
  });

  describe('GIVEN an editor whose node is shown while another field is being typed in', () => {
    let field: HTMLInputElement;

    beforeEach(async () => {
      field = document.createElement('input');
      document.body.append(field);
      field.focus();
      render(<EditorSurface text="Idea" ariaLabel="Draft" maxLength={100} autoFocus onSubmit={onSubmit} />);
      await act(async () => new Promise((resolve) => setTimeout(resolve, 10)));
    });

    afterEach(() => {
      field.remove();
    });

    describe('WHEN the editor initializes', () => {
      test('THEN the other field keeps its focus', () => {
        expect(field).toHaveFocus();
      });
    });
  });

  describe('GIVEN a composer that clears after sending', () => {
    beforeEach(() => {
      render(
        <EditorSurface
          text=""
          ariaLabel="Draft"
          maxLength={100}
          clearOnSubmit
          onSubmit={onSubmit}
          onChange={onChange}
          renderSubmit={({ disabled, submit }) => (
            <button type="button" disabled={disabled} onClick={submit}>
              Send
            </button>
          )}
        />,
      );
    });

    describe('WHEN it renders empty', () => {
      test('THEN the send control is disabled', () => {
        expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
      });
    });

    describe('WHEN two messages are written and sent', () => {
      beforeEach(() => {
        act(() => {
          editorOf(editorBox()).commands.insertContent('First');
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send' }));
        act(() => {
          editorOf(editorBox()).commands.insertContent('Second');
        });
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
      });

      test('THEN both are submitted and the composer ends up empty', () => {
        expect(onSubmit.mock.calls).toEqual([[{ text: 'First' }], [{ text: 'Second' }]]);
        expect(onChange).toHaveBeenLastCalledWith(EMPTY_PARAGRAPH_DOCUMENT);
        expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
      });
    });

    describe('WHEN Enter is pressed while it is empty', () => {
      beforeEach(() => {
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
      });

      test('THEN nothing is submitted', () => {
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a list item being edited', () => {
    beforeEach(() => {
      render(<EditorSurface text="" ariaLabel="Draft" maxLength={100} onSubmit={onSubmit} />);
      act(() => {
        editorOf(editorBox()).commands.setContent(LIST_HTML);
        editorOf(editorBox()).commands.setTextSelection(8);
      });
    });

    describe('WHEN Enter is pressed', () => {
      beforeEach(() => {
        fireEvent.keyDown(editorBox(), { key: 'Enter' });
      });

      test('THEN a new item starts instead of submitting', () => {
        expect(editorBox().querySelectorAll('li')).toHaveLength(2);
        expect(onSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a composer with a word selected and its toolbar open', () => {
    beforeEach(async () => {
      render(<EditorSurface text="Pick this word" ariaLabel="Draft" maxLength={100} autoFocus onSubmit={onSubmit} />);
      await vi.waitUntil(() => document.activeElement === editorBox());
      act(() => {
        editorOf(editorBox()).commands.setTextSelection({ from: 6, to: 10 });
      });
      await screen.findByRole('toolbar', { name: TRANSLATIONS.platform.canvas.formatting.toolbar });
    });

    describe('WHEN a format is clicked and focus then leaves for the page', () => {
      beforeEach(() => {
        const bold = screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.bold });
        fireEvent.mouseDown(bold);
        fireEvent.click(bold);
        fireEvent.blur(editorBox());
      });

      test('THEN the toolbar closes instead of floating over the canvas', () => {
        expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
      });
    });
  });
});
