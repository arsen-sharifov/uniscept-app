import { describe, expect, test } from 'vitest';

import { renderShortcut, toAriaShortcut } from '@/components/Toolbar/utils';

describe('renderShortcut', () => {
  describe('GIVEN a shortcut with modifiers', () => {
    describe('WHEN it is rendered into tokens', () => {
      test('THEN each modifier and the key become separate tokens', () => {
        expect(renderShortcut('⌘⇧Z')).toEqual(['⌘', '⇧', 'Z']);
      });
    });
  });

  describe('GIVEN a multi-character key', () => {
    describe('WHEN it is rendered into tokens', () => {
      test('THEN the characters merge into one token', () => {
        expect(renderShortcut('F2')).toEqual(['F2']);
      });
    });
  });

  describe('GIVEN a single key', () => {
    describe('WHEN it is rendered into tokens', () => {
      test('THEN a single token is produced', () => {
        expect(renderShortcut('V')).toEqual(['V']);
      });
    });
  });
});

describe('toAriaShortcut', () => {
  describe('GIVEN a shortcut with modifiers', () => {
    describe('WHEN it is converted for aria', () => {
      test('THEN symbols expand to key names', () => {
        expect(toAriaShortcut('⌘⇧Z')).toBe('Meta+Shift+Z');
      });
    });
  });

  describe('GIVEN a plain letter shortcut', () => {
    describe('WHEN it is converted for aria', () => {
      test('THEN it passes through unchanged', () => {
        expect(toAriaShortcut('V')).toBe('V');
      });
    });
  });

  describe('GIVEN a lone modifier', () => {
    describe('WHEN it is converted for aria', () => {
      test('THEN the trailing plus is stripped', () => {
        expect(toAriaShortcut('⌘')).toBe('Meta');
      });
    });
  });

  describe('GIVEN no shortcut', () => {
    describe('WHEN it is converted for aria', () => {
      test('THEN nothing is produced', () => {
        expect(toAriaShortcut(undefined)).toBeUndefined();
      });
    });
  });
});
