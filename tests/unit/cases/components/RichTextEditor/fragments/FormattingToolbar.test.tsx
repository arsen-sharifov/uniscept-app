import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { listenOnPage } from '@mocks/browser';
import { TRANSLATIONS } from '@mocks/i18n';
import { LINKED_COLORED_HTML, SELECTED_WORD_HTML, mountTestEditor, stubEditorLayout } from '@mocks/richText';
import { FormattingToolbar } from '@/components/RichTextEditor/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onModeChange = vi.fn();
const onBlur = vi.fn();
const onPageClick = vi.fn();
const onPageContextMenu = vi.fn();

let editor: Editor;

const button = (name: string) => screen.getByRole('button', { name });

beforeEach(() => {
  stubEditorLayout();
  listenOnPage({ click: onPageClick, contextmenu: onPageContextMenu });
});

describe('FormattingToolbar', () => {
  describe('GIVEN a selected plain word', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.commands.setTextSelection({ from: 6, to: 10 });
      render(<FormattingToolbar editor={editor} mode="format" onModeChange={onModeChange} onBlur={onBlur} />);
    });

    describe('WHEN the toolbar renders', () => {
      test('THEN every format is offered, none pressed, with its shortcut in the hint', () => {
        expect(
          screen.getByRole('toolbar', { name: TRANSLATIONS.platform.canvas.formatting.toolbar }),
        ).toBeInTheDocument();
        expect(button(TRANSLATIONS.platform.canvas.formatting.bold)).toHaveAttribute('aria-pressed', 'false');
        expect(button(TRANSLATIONS.platform.canvas.formatting.bold)).toHaveAttribute(
          'title',
          `${TRANSLATIONS.platform.canvas.formatting.bold} ⌘B`,
        );
        expect(button(TRANSLATIONS.platform.canvas.formatting.color)).toHaveAttribute(
          'title',
          TRANSLATIONS.platform.canvas.formatting.color,
        );
        expect(screen.getAllByRole('button')).toHaveLength(8);
      });
    });

    describe('WHEN bold and strikethrough are clicked', () => {
      beforeEach(() => {
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.bold));
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.strike));
      });

      test('THEN both marks land on the selection and show as pressed', () => {
        expect(editor.getHTML()).toBe('<p>Pick <strong><s>this</s></strong> word</p>');
        expect(button(TRANSLATIONS.platform.canvas.formatting.bold)).toHaveAttribute('aria-pressed', 'true');
        expect(button(TRANSLATIONS.platform.canvas.formatting.strike)).toHaveAttribute('aria-pressed', 'true');
      });
    });

    describe('WHEN the numbered list is clicked', () => {
      beforeEach(() => {
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.orderedList));
      });

      test('THEN the paragraph becomes a numbered list item', () => {
        expect(editor.getHTML()).toBe('<ol><li><p>Pick this word</p></li></ol>');
        expect(button(TRANSLATIONS.platform.canvas.formatting.orderedList)).toHaveAttribute('aria-pressed', 'true');
      });
    });

    describe('WHEN the link and color buttons are clicked', () => {
      beforeEach(() => {
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.link));
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.color));
      });

      test('THEN the toolbar is asked to switch to those modes', () => {
        expect(onModeChange.mock.calls).toEqual([['link'], ['color']]);
      });
    });

    describe('WHEN a button is pressed and clicked', () => {
      let pressAllowed: boolean;

      beforeEach(() => {
        pressAllowed = fireEvent.mouseDown(button(TRANSLATIONS.platform.canvas.formatting.italic));
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.italic));
      });

      test('THEN focus stays in the editor and the click never reaches the canvas', () => {
        expect(pressAllowed).toBe(false);
        expect(onPageClick).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the toolbar is right clicked', () => {
      beforeEach(() => {
        fireEvent.contextMenu(button(TRANSLATIONS.platform.canvas.formatting.italic));
      });

      test('THEN the node behind it never opens its context menu', () => {
        expect(onPageContextMenu).not.toHaveBeenCalled();
      });
    });

    describe('WHEN focus leaves the toolbar', () => {
      beforeEach(() => {
        fireEvent.blur(button(TRANSLATIONS.platform.canvas.formatting.italic));
      });

      test('THEN the owner hears about it', () => {
        expect(onBlur).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN a selected colored link', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
      editor.commands.setTextSelection({ from: 2, to: 5 });
      render(<FormattingToolbar editor={editor} mode="format" onModeChange={onModeChange} onBlur={onBlur} />);
    });

    describe('WHEN the toolbar renders', () => {
      test('THEN the link and color buttons show as pressed and the color tints its icon', () => {
        expect(button(TRANSLATIONS.platform.canvas.formatting.link)).toHaveAttribute('aria-pressed', 'true');
        expect(button(TRANSLATIONS.platform.canvas.formatting.color)).toHaveAttribute('aria-pressed', 'true');
        expect(button(TRANSLATIONS.platform.canvas.formatting.color).querySelector('svg')).toHaveStyle({
          color: 'var(--ink-green)',
        });
      });
    });

    describe('WHEN the selection moves to plain text', () => {
      beforeEach(() => {
        act(() => {
          editor.commands.setTextSelection({ from: 8, to: 12 });
        });
      });

      test('THEN the pressed states follow the editor', () => {
        expect(button(TRANSLATIONS.platform.canvas.formatting.link)).toHaveAttribute('aria-pressed', 'false');
        expect(button(TRANSLATIONS.platform.canvas.formatting.bold)).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  describe('GIVEN the toolbar in link mode', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
      editor.commands.setTextSelection({ from: 2, to: 5 });
      render(<FormattingToolbar editor={editor} mode="link" onModeChange={onModeChange} onBlur={onBlur} />);
    });

    describe('WHEN the address field is pressed', () => {
      let pressAllowed: boolean;

      beforeEach(() => {
        pressAllowed = fireEvent.mouseDown(
          screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.formatting.linkAddress }),
        );
      });

      test('THEN the field can take focus and shows the current address', () => {
        expect(pressAllowed).toBe(true);
        expect(screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.formatting.linkAddress })).toHaveValue(
          'https://example.com/a',
        );
      });
    });

    describe('WHEN the form is left with the back button', () => {
      beforeEach(() => {
        fireEvent.click(button(TRANSLATIONS.platform.canvas.formatting.back));
      });

      test('THEN the toolbar goes back to the formats', () => {
        expect(onModeChange).toHaveBeenCalledExactlyOnceWith('format');
      });
    });
  });

  describe('GIVEN the toolbar in color mode', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.commands.setTextSelection({ from: 6, to: 10 });
      render(<FormattingToolbar editor={editor} mode="color" onModeChange={onModeChange} onBlur={onBlur} />);
    });

    describe('WHEN the toolbar renders', () => {
      test('THEN the palette replaces the formats', () => {
        expect(button(TRANSLATIONS.platform.canvas.formatting.colors.violet)).toBeInTheDocument();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.bold }),
        ).not.toBeInTheDocument();
      });
    });
  });
});
