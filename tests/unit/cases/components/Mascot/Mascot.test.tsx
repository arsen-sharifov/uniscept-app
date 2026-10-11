import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { MASCOT_LABEL } from '@mocks/mascot';
import { Mascot } from '@/components/Mascot';

const mascot = () => screen.getByRole('img', { name: MASCOT_LABEL });

const blinkingEyes = () => mascot().querySelectorAll('ellipse.animate-mascot-blink');

describe('Mascot', () => {
  describe('GIVEN the mascot at rest', () => {
    describe('WHEN it is rendered', () => {
      beforeEach(() => {
        render(<Mascot label={MASCOT_LABEL} pose="idle" />);
      });

      test('THEN it carries its label and blinks with both eyes', () => {
        expect(blinkingEyes()).toHaveLength(2);
      });

      test('THEN it has round eyes and no antenna', () => {
        expect(blinkingEyes()[0]).toHaveAttribute('rx', blinkingEyes()[0]?.getAttribute('ry'));
        expect(mascot().querySelector('circle[fill="var(--accent-2)"]')).toBeNull();
      });
    });
  });

  describe('GIVEN the mascot celebrating', () => {
    describe('WHEN it is rendered', () => {
      beforeEach(() => {
        render(<Mascot label={MASCOT_LABEL} pose="cheer" />);
      });

      test('THEN the round eyes turn into happy arcs', () => {
        expect(blinkingEyes()).toHaveLength(0);
      });
    });
  });

  describe('GIVEN the friend from the example guide', () => {
    describe('WHEN it is rendered', () => {
      beforeEach(() => {
        render(<Mascot label={MASCOT_LABEL} pose="idle" character="ergo" />);
      });

      test('THEN it wears an antenna and taller oval eyes', () => {
        expect(mascot().querySelector('circle[fill="var(--accent-2)"]')).not.toBeNull();
        expect(Number(blinkingEyes()[0]?.getAttribute('ry'))).toBeGreaterThan(
          Number(blinkingEyes()[0]?.getAttribute('rx')),
        );
      });
    });
  });
});
