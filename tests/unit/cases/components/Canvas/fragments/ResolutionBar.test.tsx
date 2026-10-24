import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { THREAD_ID, canvasEdge, canvasNode, questionNode } from '@mocks/canvas';
import { TRANSLATIONS } from '@mocks/i18n';
import { ResolutionBar } from '@/components/Canvas/fragments';
import { useCanvasStore } from '@/lib/stores';

vi.mock('@/i18n', () => import('@mocks/i18n'));

afterEach(() => {
  useCanvasStore.getState().clearCanvas();
});

describe('ResolutionBar', () => {
  describe('GIVEN a thread whose answer is validated under the question', () => {
    beforeEach(() => {
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [questionNode('q'), canvasNode('n1', { status: 'valid', isAnswer: true })],
        edges: [canvasEdge('e1', 'q', 'n1')],
        authors: {},
      });
      render(<ResolutionBar />);
    });

    describe('WHEN the bar renders', () => {
      test('THEN the thread is announced as resolved', () => {
        expect(screen.getByText(TRANSLATIONS.platform.canvas.resolution.resolved)).toBeInTheDocument();
      });
    });
  });

  describe('GIVEN a thread whose answer is not validated', () => {
    beforeEach(() => {
      useCanvasStore.getState().loadCanvas(THREAD_ID, {
        nodes: [questionNode('q'), canvasNode('n1', { isAnswer: true, status: 'invalid' })],
        edges: [canvasEdge('e1', 'q', 'n1')],
        authors: {},
      });
      render(<ResolutionBar />);
    });

    describe('WHEN the bar renders', () => {
      test('THEN nothing is announced', () => {
        expect(screen.queryByText(TRANSLATIONS.platform.canvas.resolution.resolved)).not.toBeInTheDocument();
      });
    });
  });
});
