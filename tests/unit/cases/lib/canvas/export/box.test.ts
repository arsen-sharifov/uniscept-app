import { describe, expect, test } from 'vitest';

import { ALARM_WASH_GRADIENT, TWO_TONE_GRADIENT } from '@mocks/canvasExport';
import { parseWashColor } from '@/lib/canvas/export';

describe('parseWashColor', () => {
  describe('GIVEN a flat two-stop gradient used as an alarm wash', () => {
    describe('WHEN the wash colour is parsed', () => {
      test('THEN the shared stop colour is returned', () => {
        expect(parseWashColor(ALARM_WASH_GRADIENT)).toBe('color-mix(in srgb, rgb(220, 38, 38) 12%, transparent)');
      });
    });
  });

  describe('GIVEN a real gradient or no background image', () => {
    describe('WHEN the wash colour is parsed', () => {
      test('THEN nothing is treated as a wash', () => {
        expect(parseWashColor(TWO_TONE_GRADIENT)).toBeUndefined();
        expect(parseWashColor('none')).toBeUndefined();
      });
    });
  });
});
