import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IRichTextEditorOptions } from '@interfaces';

import { event } from '@mocks/events';
import { TRANSLATIONS } from '@mocks/i18n';
import { EDITOR_CRASH, stubEditorLayout } from '@mocks/richText';
import { RichTextEditor, preloadRichTextEditor } from '@/components/RichTextEditor';
import { EditorSurface } from '@/components/RichTextEditor/fragments';

vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));
vi.mock('@/components/RichTextEditor/fragments', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();

  return { ...actual, EditorSurface: vi.fn(actual.EditorSurface as (options: IRichTextEditorOptions) => ReactNode) };
});

const onSubmit = vi.fn();
const onCancel = vi.fn();
const onCaughtError = vi.fn();

beforeAll(async () => {
  await preloadRichTextEditor();
});

beforeEach(() => {
  stubEditorLayout();
});

describe('RichTextEditor', () => {
  describe('GIVEN the editor code has not loaded yet', () => {
    beforeEach(() => {
      render(
        <RichTextEditor
          text="Idea"
          ariaLabel="Node text"
          maxLength={100}
          onSubmit={onSubmit}
          fallback={<p data-testid="static-label">Idea</p>}
        />,
      );
    });

    describe('WHEN it first renders', () => {
      test('THEN the static fallback holds the place', () => {
        expect(screen.getByTestId('static-label')).toBeInTheDocument();
      });
    });

    describe('WHEN the editor code arrives', () => {
      beforeEach(async () => {
        await screen.findByRole('textbox', { name: 'Node text' });
      });

      test('THEN the editor replaces the fallback', () => {
        expect(screen.queryByTestId('static-label')).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Node text' })).toHaveTextContent('Idea');
      });
    });
  });

  describe('GIVEN an editor that fails to load', () => {
    beforeEach(async () => {
      vi.mocked(EditorSurface).mockImplementation(() => {
        throw EDITOR_CRASH;
      });
      render(
        <RichTextEditor
          text="Idea"
          ariaLabel="Node text"
          maxLength={100}
          onSubmit={onSubmit}
          onCancel={onCancel}
          fallback={<p data-testid="static-label">Idea</p>}
        />,
        { onCaughtError },
      );
      await vi.waitUntil(() => vi.mocked(event.error).mock.calls.length > 0);
    });

    describe('WHEN the failure is caught', () => {
      test('THEN the static label stays, the user is told and editing ends', () => {
        expect(screen.getByTestId('static-label')).toBeInTheDocument();
        expect(event.error).toHaveBeenCalledExactlyOnceWith(EDITOR_CRASH, {
          title: TRANSLATIONS.common.errorTitles.editFailed,
          context: 'richText.editor',
        });
        expect(onCancel).toHaveBeenCalledOnce();
      });
    });
  });
});

describe('preloadRichTextEditor', () => {
  describe('GIVEN a canvas that may soon edit text', () => {
    describe('WHEN the editor is preloaded', () => {
      test('THEN the editor surface module resolves', async () => {
        await expect(preloadRichTextEditor()).resolves.toHaveProperty('EditorSurface');
      });
    });
  });
});
