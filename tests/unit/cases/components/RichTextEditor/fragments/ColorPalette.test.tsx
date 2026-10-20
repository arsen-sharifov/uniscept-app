import { fireEvent, render, screen } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { LINKED_COLORED_HTML, SELECTED_WORD_HTML, mountTestEditor, stubEditorLayout } from '@mocks/richText';
import { ColorPalette } from '@/components/RichTextEditor/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onDone = vi.fn();

let editor: Editor;

const swatch = (name: string) => screen.getByRole('button', { name });

beforeEach(() => {
  stubEditorLayout();
});

describe('ColorPalette', () => {
  describe('GIVEN a selected word without a color', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.commands.setTextSelection({ from: 6, to: 10 });
      render(<ColorPalette editor={editor} color={null} onDone={onDone} />);
    });

    describe('WHEN the palette renders', () => {
      test('THEN the default swatch is selected and every palette color is tinted with its token', () => {
        expect(swatch(TRANSLATIONS.platform.canvas.formatting.colors.default)).toHaveAttribute('aria-pressed', 'true');
        expect(swatch(TRANSLATIONS.platform.canvas.formatting.colors.blue)).toHaveAttribute('aria-pressed', 'false');
        expect(swatch(TRANSLATIONS.platform.canvas.formatting.colors.blue)).toHaveStyle({ color: 'var(--ink-blue)' });
      });
    });

    describe('WHEN blue is picked', () => {
      beforeEach(() => {
        fireEvent.click(swatch(TRANSLATIONS.platform.canvas.formatting.colors.blue));
      });

      test('THEN the word turns blue and the palette closes', () => {
        expect(editor.getHTML()).toBe('<p>Pick <span data-text-color="blue">this</span> word</p>');
        expect(onDone).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN the palette is left with the back button', () => {
      beforeEach(() => {
        fireEvent.click(swatch(TRANSLATIONS.platform.canvas.formatting.back));
      });

      test('THEN nothing changes and the palette closes', () => {
        expect(editor.getHTML()).toBe('<p>Pick this word</p>');
        expect(onDone).toHaveBeenCalledOnce();
      });
    });
  });

  describe('GIVEN selected green text', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
      editor.commands.setTextSelection({ from: 2, to: 5 });
      render(<ColorPalette editor={editor} color="green" onDone={onDone} />);
    });

    describe('WHEN the default color is picked', () => {
      beforeEach(() => {
        fireEvent.click(swatch(TRANSLATIONS.platform.canvas.formatting.colors.default));
      });

      test('THEN the color is removed from the selection', () => {
        expect(swatch(TRANSLATIONS.platform.canvas.formatting.colors.green)).toHaveAttribute('aria-pressed', 'true');
        expect(editor.getHTML()).toContain('<span data-text-color="green">L</span>');
        expect(editor.getHTML()).toContain('</span>ink<span');
        expect(onDone).toHaveBeenCalledOnce();
      });
    });
  });
});
