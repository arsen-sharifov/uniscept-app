import { render } from '@testing-library/react';
import { Position } from '@xyflow/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { canvasEdge, edgeProps } from '@mocks/canvas';
import { EDGE_GEOMETRY } from '@mocks/geometry';
import { CanvasEdge } from '@/components/Canvas/fragments';
import { getCanvasEdgePath } from '@/lib/canvas';

const edgeGroup = () => document.querySelector('[data-export-edge="e1"]');
const edgePath = () => document.getElementById('e1');
const reverseOverlay = () => document.querySelector('.canvas-edge-bidi-reverse');

describe('CanvasEdge', () => {
  describe('GIVEN a one-way edge carrying the invalid tone whose stored handles differ from the sides it is drawn between', () => {
    beforeEach(() => {
      render(
        <svg>
          <CanvasEdge
            {...edgeProps({
              ...canvasEdge('e1', 'a', 'b'),
              sourceHandle: 'bottom',
              targetHandle: 'top',
              data: { tone: 'invalid', bidirectional: false },
            })}
          />
        </svg>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN the path runs between the sides with the tone arrow at the target only and no reverse overlay', () => {
        const path = getCanvasEdgePath({
          ...EDGE_GEOMETRY,
          sourceSide: 'right',
          targetSide: 'left',
          bidirectional: false,
        });

        expect(edgePath()).toHaveAttribute('d', path);
        expect(edgePath()).toHaveAttribute('marker-end', 'url(#canvas-arrow-invalid)');
        expect(edgePath()).not.toHaveAttribute('marker-start');
        expect(reverseOverlay()).not.toBeInTheDocument();
      });

      test('THEN its group names the endpoints, handles and tone for the export', () => {
        expect(edgeGroup()).toHaveAttribute('data-source', 'a');
        expect(edgeGroup()).toHaveAttribute('data-target', 'b');
        expect(edgeGroup()).toHaveAttribute('data-source-handle', 'bottom');
        expect(edgeGroup()).toHaveAttribute('data-target-handle', 'top');
        expect(edgeGroup()).toHaveAttribute('data-tone', 'invalid');
        expect(edgeGroup()).not.toHaveAttribute('data-bidirectional');
      });
    });
  });

  describe('GIVEN a bidirectional edge', () => {
    beforeEach(() => {
      render(
        <svg>
          <CanvasEdge {...edgeProps({ ...canvasEdge('e1', 'a', 'b'), data: { tone: 'valid', bidirectional: true } })} />
        </svg>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN arrows sit at both ends and a reverse overlay follows the shortened path', () => {
        const path = getCanvasEdgePath({
          ...EDGE_GEOMETRY,
          sourceSide: 'right',
          targetSide: 'left',
          bidirectional: true,
        });

        expect(edgePath()).toHaveAttribute('marker-start', 'url(#canvas-arrow-valid)');
        expect(edgePath()).toHaveAttribute('marker-end', 'url(#canvas-arrow-valid)');
        expect(edgePath()).toHaveAttribute('d', path);
        expect(reverseOverlay()).toHaveAttribute('d', path);
        expect(edgeGroup()).toHaveAttribute('data-bidirectional', 'true');
      });
    });
  });

  describe('GIVEN an edge without handle ids', () => {
    beforeEach(() => {
      const { sourceHandle: _sourceHandle, targetHandle: _targetHandle, ...bareEdge } = canvasEdge('e1', 'a', 'b');

      render(
        <svg>
          <CanvasEdge {...edgeProps(bareEdge)} />
        </svg>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN its group names the sides it is drawn between as the handles', () => {
        expect(edgeGroup()).toHaveAttribute('data-source-handle', Position.Right);
        expect(edgeGroup()).toHaveAttribute('data-target-handle', Position.Left);
      });
    });
  });

  describe('GIVEN an edge without data, handle ids or sides', () => {
    beforeEach(() => {
      const { sourceHandle: _sourceHandle, targetHandle: _targetHandle, ...bareEdge } = canvasEdge('e1', 'a', 'b');

      render(
        <svg>
          <CanvasEdge
            {...edgeProps(bareEdge)}
            sourcePosition={undefined as never}
            targetPosition={undefined as never}
          />
        </svg>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN it falls back to the default tone and runs from the bottom to the top', () => {
        expect(edgePath()).toHaveAttribute(
          'd',
          getCanvasEdgePath({
            ...EDGE_GEOMETRY,
            sourceSide: Position.Bottom,
            targetSide: Position.Top,
            bidirectional: false,
          }),
        );
        expect(edgePath()).toHaveAttribute('marker-end', 'url(#canvas-arrow-default)');
        expect(edgeGroup()).toHaveAttribute('data-tone', 'default');
        expect(edgeGroup()).not.toHaveAttribute('data-source-handle');
      });
    });
  });
});
