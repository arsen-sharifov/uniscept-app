import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from '@constants';
import { PREFERENCES } from '@mocks/preferences';
import { readFromStorage, writeToStorage } from '@/app/platform/components/Settings/utils';

afterEach(() => {
  localStorage.clear();
});

describe('readFromStorage', () => {
  describe('GIVEN valid persisted preferences', () => {
    describe('WHEN storage is read', () => {
      test('THEN every field is restored', () => {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(PREFERENCES));

        expect(readFromStorage()).toEqual(PREFERENCES);
      });
    });
  });

  describe('GIVEN partially invalid persisted preferences', () => {
    describe('WHEN storage is read', () => {
      test('THEN invalid fields fall back per field', () => {
        localStorage.setItem(
          PREFERENCES_STORAGE_KEY,
          JSON.stringify({ theme: 'neon', defaultZoom: 37, snapToGrid: 'yes', canvasPattern: 'lines' }),
        );

        expect(readFromStorage()).toEqual({
          theme: DEFAULT_PREFERENCES.theme,
          canvasPattern: 'lines',
          language: DEFAULT_PREFERENCES.language,
          snapToGrid: DEFAULT_PREFERENCES.snapToGrid,
          defaultZoom: DEFAULT_PREFERENCES.defaultZoom,
          smartGuides: DEFAULT_PREFERENCES.smartGuides,
        });
      });
    });
  });

  describe('GIVEN corrupted persisted data', () => {
    describe('WHEN storage is read', () => {
      test('THEN the defaults apply', () => {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, '{oops');

        expect(readFromStorage()).toEqual(DEFAULT_PREFERENCES);
      });
    });
  });

  describe('GIVEN persisted data that is valid JSON but not an object', () => {
    describe('WHEN storage is read', () => {
      test('THEN the defaults apply', () => {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, '42');

        expect(readFromStorage()).toEqual(DEFAULT_PREFERENCES);
      });
    });
  });

  describe('GIVEN an empty storage', () => {
    describe('WHEN storage is read', () => {
      test('THEN the defaults apply', () => {
        expect(readFromStorage()).toEqual(DEFAULT_PREFERENCES);
      });
    });
  });

  describe('GIVEN a server environment', () => {
    beforeEach(() => {
      vi.stubGlobal('window', undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe('WHEN storage is read', () => {
      test('THEN the defaults apply', () => {
        expect(readFromStorage()).toEqual(DEFAULT_PREFERENCES);
      });
    });

    describe('WHEN storage is written', () => {
      test('THEN nothing throws and nothing is stored', () => {
        expect(() => writeToStorage(DEFAULT_PREFERENCES)).not.toThrow();
        expect(localStorage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();
      });
    });
  });
});

describe('writeToStorage', () => {
  describe('GIVEN a preferences object', () => {
    describe('WHEN it is written', () => {
      test('THEN the storage round-trips the same values', () => {
        writeToStorage({ ...DEFAULT_PREFERENCES, theme: 'graphite', defaultZoom: 150 });

        expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)!)).toEqual({
          ...DEFAULT_PREFERENCES,
          theme: 'graphite',
          defaultZoom: 150,
        });
      });
    });
  });
});
