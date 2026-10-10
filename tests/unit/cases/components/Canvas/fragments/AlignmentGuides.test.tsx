import { render } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { PannedFlowProvider } from '@mocks/canvas';
import { AlignmentGuides } from '@/components/Canvas/fragments';

const guideLines = () => Array.from(document.querySelectorAll('line'));

describe('AlignmentGuides', () => {
  describe('GIVEN a vertical and a horizontal guide in a viewport panned by 20 and 40 at double zoom', () => {
    beforeEach(() => {
      render(
        <PannedFlowProvider>
          <AlignmentGuides
            guides={[
              { direction: 'vertical', position: 120, start: 10, end: 300 },
              { direction: 'horizontal', position: 80, start: -40, end: 260 },
            ]}
          />
        </PannedFlowProvider>,
      );
    });

    describe('WHEN they render', () => {
      test('THEN each guide spans its range on screen, the vertical one along the y axis and the horizontal one along the x axis', () => {
        expect(guideLines().map((line) => ['x1', 'y1', 'x2', 'y2'].map((name) => line.getAttribute(name)))).toEqual([
          ['260', '60', '260', '640'],
          ['-60', '200', '540', '200'],
        ]);
      });
    });
  });

  describe('GIVEN no guides', () => {
    beforeEach(() => {
      render(
        <ReactFlowProvider>
          <AlignmentGuides guides={[]} />
        </ReactFlowProvider>,
      );
    });

    describe('WHEN it renders', () => {
      test('THEN nothing is drawn', () => {
        expect(document.querySelector('svg')).not.toBeInTheDocument();
      });
    });
  });
});
