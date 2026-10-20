import { fireEvent, render, screen } from '@testing-library/react';
import type { Editor } from '@tiptap/core';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TRANSLATIONS } from '@mocks/i18n';
import { LINKED_COLORED_HTML, SELECTED_WORD_HTML, mountTestEditor, stubEditorLayout } from '@mocks/richText';
import { LinkForm } from '@/components/RichTextEditor/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));

const onDone = vi.fn();

let editor: Editor;

const addressField = () => screen.getByRole('textbox', { name: TRANSLATIONS.platform.canvas.formatting.linkAddress });

beforeEach(() => {
  stubEditorLayout();
});

describe('LinkForm', () => {
  describe('GIVEN a selected word without a link', () => {
    beforeEach(() => {
      editor = mountTestEditor(SELECTED_WORD_HTML);
      editor.commands.setTextSelection({ from: 6, to: 10 });
      render(<LinkForm editor={editor} href={null} onDone={onDone} />);
    });

    describe('WHEN the form opens', () => {
      test('THEN the empty address field takes focus and no remove action is offered', () => {
        expect(addressField()).toHaveValue('');
        expect(addressField()).toHaveFocus();
        expect(
          screen.queryByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.removeLink }),
        ).not.toBeInTheDocument();
      });
    });

    describe('WHEN a bare domain is applied', () => {
      beforeEach(() => {
        fireEvent.change(addressField(), { target: { value: 'example.com/docs' } });
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.applyLink }));
      });

      test('THEN the word links to the https address and the form closes', () => {
        expect(editor.getHTML()).toBe(
          '<p>Pick <a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com/docs">this</a> word</p>',
        );
        expect(onDone).toHaveBeenCalledOnce();
      });
    });

    describe('WHEN a script address is submitted with Enter', () => {
      beforeEach(() => {
        fireEvent.change(addressField(), { target: { value: 'javascript:alert(1)' } });
        fireEvent.submit(addressField());
      });

      test('THEN the field is marked invalid with an explanation and nothing is linked', () => {
        expect(screen.getByRole('alert')).toHaveTextContent(TRANSLATIONS.platform.canvas.formatting.invalidLink);
        expect(addressField()).toHaveAttribute('aria-invalid', 'true');
        expect(addressField()).toHaveAccessibleDescription(TRANSLATIONS.platform.canvas.formatting.invalidLink);
        expect(editor.getHTML()).toBe('<p>Pick this word</p>');
        expect(onDone).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the address is corrected after an invalid attempt', () => {
      beforeEach(() => {
        fireEvent.change(addressField(), { target: { value: 'javascript:alert(1)' } });
        fireEvent.submit(addressField());
        fireEvent.change(addressField(), { target: { value: 'example.com' } });
      });

      test('THEN the error clears', () => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(addressField()).toHaveAttribute('aria-invalid', 'false');
      });
    });

    describe('WHEN Escape is pressed in the field', () => {
      beforeEach(() => {
        fireEvent.keyDown(addressField(), { key: 'Escape' });
      });

      test('THEN the form closes without linking', () => {
        expect(onDone).toHaveBeenCalledOnce();
        expect(editor.getHTML()).toBe('<p>Pick this word</p>');
      });
    });

    describe('WHEN another key is pressed in the field', () => {
      beforeEach(() => {
        fireEvent.keyDown(addressField(), { key: 'a' });
      });

      test('THEN the form stays open', () => {
        expect(onDone).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN the caret inside an existing link', () => {
    beforeEach(() => {
      editor = mountTestEditor(LINKED_COLORED_HTML);
      editor.commands.setTextSelection(3);
      render(<LinkForm editor={editor} href="https://example.com/a" onDone={onDone} />);
    });

    describe('WHEN the form opens', () => {
      test('THEN the current address is filled in', () => {
        expect(addressField()).toHaveValue('https://example.com/a');
      });
    });

    describe('WHEN the address is edited', () => {
      beforeEach(() => {
        fireEvent.change(addressField(), { target: { value: 'team@example.com' } });
        fireEvent.submit(addressField());
      });

      test('THEN the whole link text points at the new address', () => {
        expect(editor.getHTML()).toContain('href="mailto:team@example.com"');
        expect(editor.getHTML()).not.toContain('https://example.com/a');
      });
    });

    describe('WHEN the link is removed', () => {
      beforeEach(() => {
        fireEvent.click(screen.getByRole('button', { name: TRANSLATIONS.platform.canvas.formatting.removeLink }));
      });

      test('THEN the whole link text loses the link and keeps its other marks', () => {
        expect(editor.getHTML()).not.toContain('<a ');
        expect(editor.getHTML()).toContain('<strong><span data-text-color="green">Linked</span></strong>');
        expect(onDone).toHaveBeenCalledOnce();
      });
    });
  });
});
