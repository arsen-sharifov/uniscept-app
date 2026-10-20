'use client';

import { lazy, type ReactNode, Suspense } from 'react';

import type { IRichTextEditorOptions } from '@interfaces';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useTranslations } from '@/i18n';

export const preloadRichTextEditor = () => import('./fragments');

const EditorSurface = lazy(() => preloadRichTextEditor().then((module) => ({ default: module.EditorSurface })));

interface IRichTextEditorProps extends IRichTextEditorOptions {
  fallback: ReactNode;
}

export const RichTextEditor = ({ fallback, ...options }: IRichTextEditorProps) => {
  const t = useTranslations();

  return (
    <ErrorBoundary
      fallback={fallback}
      report={{ title: t.common.errorTitles.editFailed, context: 'richText.editor' }}
      onError={options.onCancel}
    >
      <Suspense fallback={fallback}>
        <EditorSurface {...options} />
      </Suspense>
    </ErrorBoundary>
  );
};
