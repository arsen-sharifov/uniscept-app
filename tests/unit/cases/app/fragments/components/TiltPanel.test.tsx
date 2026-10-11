import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { REDUCED_MOTION_QUERY } from '@constants';
import { domRect, stubMediaQueries } from '@mocks/browser';
import { TiltPanel } from '@/app/fragments/components';
import { FINE_POINTER_QUERY } from '@/app/fragments/consts';

let media: ReturnType<typeof stubMediaQueries>;

const panel = () => screen.getByText('Plan').parentElement!;

beforeEach(() => {
  media = stubMediaQueries();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TiltPanel', () => {
  describe('GIVEN a mouse pointer', () => {
    beforeEach(() => {
      media.change(FINE_POINTER_QUERY, true);
      render(
        <TiltPanel>
          <p>Plan</p>
        </TiltPanel>,
      );
      vi.spyOn(panel(), 'getBoundingClientRect').mockReturnValue(domRect({ width: 200, height: 100 }));
    });

    describe('WHEN the pointer moves to the top right corner', () => {
      beforeEach(() => {
        fireEvent.pointerMove(panel(), { clientX: 200, clientY: 0 });
      });

      test('THEN the panel tilts toward it', () => {
        expect(panel().style.transform).toBe('perspective(900px) rotateX(1.20deg) rotateY(1.20deg)');
      });
    });

    describe('WHEN the pointer leaves after moving', () => {
      beforeEach(() => {
        fireEvent.pointerMove(panel(), { clientX: 200, clientY: 0 });
        fireEvent.pointerLeave(panel());
      });

      test('THEN the panel settles flat', () => {
        expect(panel().style.transform).toBe('');
      });
    });
  });

  describe('GIVEN a mouse pointer and reduced motion', () => {
    beforeEach(() => {
      media.change(FINE_POINTER_QUERY, true);
      media.change(REDUCED_MOTION_QUERY, true);
      render(
        <TiltPanel>
          <p>Plan</p>
        </TiltPanel>,
      );
      vi.spyOn(panel(), 'getBoundingClientRect').mockReturnValue(domRect({ width: 200, height: 100 }));
    });

    describe('WHEN the pointer moves over the panel', () => {
      beforeEach(() => {
        fireEvent.pointerMove(panel(), { clientX: 200, clientY: 0 });
      });

      test('THEN it stays flat', () => {
        expect(panel().style.transform).toBe('');
      });
    });
  });

  describe('GIVEN a touch pointer', () => {
    beforeEach(() => {
      render(
        <TiltPanel>
          <p>Plan</p>
        </TiltPanel>,
      );
      vi.spyOn(panel(), 'getBoundingClientRect').mockReturnValue(domRect({ width: 200, height: 100 }));
    });

    describe('WHEN the pointer moves over the panel', () => {
      beforeEach(() => {
        fireEvent.pointerMove(panel(), { clientX: 200, clientY: 0 });
      });

      test('THEN it stays flat', () => {
        expect(panel().style.transform).toBe('');
      });
    });
  });
});
