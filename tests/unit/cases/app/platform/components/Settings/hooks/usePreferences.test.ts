import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { IPreferences } from '@interfaces';
import { DEFAULT_PREFERENCES, PREFERENCES_DEBOUNCE_MS, PREFERENCES_STORAGE_KEY } from '@constants';
import { getPreferences, upsertPreferences } from '@api/client';
import { TRANSLATIONS } from '@mocks/i18n';
import { PREFERENCES } from '@mocks/preferences';
import { usePreferences } from '@/app/platform/components/Settings/hooks';
import { event } from '@/lib/events';

vi.mock('@api/client', async () => ({
  ...(await import('@mocks/canvasApi')),
  ...(await import('@mocks/userApi')),
  ...(await import('@mocks/workspaceApi')),
}));
vi.mock('@/i18n', () => import('@mocks/i18n'));
vi.mock('@/lib/events', () => import('@mocks/events'));

const PREFERENCE_ATTRIBUTES = [
  'data-theme',
  'data-canvas-pattern',
  'data-snap-to-grid',
  'data-default-zoom',
  'data-smart-guides',
];

let prefs: { current: ReturnType<typeof usePreferences> };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(async () => {
  cleanup();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
  localStorage.clear();
  PREFERENCE_ATTRIBUTES.forEach((attribute) => document.documentElement.removeAttribute(attribute));
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('usePreferences', () => {
  describe('GIVEN locally persisted preferences and no remote row', () => {
    beforeEach(() => {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(PREFERENCES));
      vi.mocked(getPreferences).mockResolvedValue(null);

      prefs = renderHook(() => usePreferences()).result;
    });

    describe('WHEN the hook mounts', () => {
      test('THEN the stored preferences hydrate the state', () => {
        expect(prefs.current.preferences).toEqual(PREFERENCES);
      });

      test('THEN the document reflects every preference attribute', () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('eclipse');
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('lines');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('true');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('125');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('false');
      });
    });

    describe('WHEN the remote load settles', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the local preferences stay without a save', () => {
        expect(prefs.current.preferences).toEqual(PREFERENCES);
        expect(getPreferences).toHaveBeenCalledTimes(1);
        expect(upsertPreferences).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN remote preferences behind the api', () => {
    beforeEach(() => {
      vi.mocked(getPreferences).mockResolvedValue(PREFERENCES);

      prefs = renderHook(() => usePreferences()).result;
    });

    describe('WHEN the hook mounts', () => {
      test('THEN the defaults apply until the load settles', () => {
        expect(prefs.current.preferences).toEqual(DEFAULT_PREFERENCES);
        expect(document.documentElement.getAttribute('data-theme')).toBe('auto');
      });
    });

    describe('WHEN the remote load settles', () => {
      beforeEach(async () => {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
      });

      test('THEN the remote preferences replace the defaults and persist locally', () => {
        expect(prefs.current.preferences).toEqual(PREFERENCES);
        expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)!)).toEqual(PREFERENCES);
        expect(document.documentElement.getAttribute('data-theme')).toBe('eclipse');
      });
    });
  });

  describe('GIVEN loaded preferences over an accepting api', () => {
    let unmountPrefs: () => void;

    beforeEach(async () => {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(PREFERENCES));
      vi.mocked(getPreferences).mockResolvedValue(null);
      vi.mocked(upsertPreferences).mockResolvedValue(undefined);

      const view = renderHook(() => usePreferences());

      prefs = view.result;
      unmountPrefs = view.unmount;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN a preference changes', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
        });
      });

      test('THEN the state, the storage and the document update before any save', () => {
        expect(prefs.current.preferences).toEqual({ ...PREFERENCES, theme: 'graphite' });
        expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)!)).toEqual({
          ...PREFERENCES,
          theme: 'graphite',
        });
        expect(document.documentElement.getAttribute('data-theme')).toBe('graphite');
        expect(upsertPreferences).not.toHaveBeenCalled();
      });
    });

    describe('WHEN a changed preference passes the debounce', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN a single save carries the merged payload', () => {
        expect(upsertPreferences).toHaveBeenCalledExactlyOnceWith({ ...PREFERENCES, theme: 'graphite' });
      });
    });

    describe('WHEN two changes land within one debounce window', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
        });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS / 2);
        });
        await act(async () => {
          prefs.current.updatePreference('theme', 'solstice');
        });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN a single save carries the last value', () => {
        expect(prefs.current.preferences.theme).toBe('solstice');
        expect(upsertPreferences).toHaveBeenCalledExactlyOnceWith({ ...PREFERENCES, theme: 'solstice' });
      });
    });

    describe('WHEN several preferences change quickly', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('canvasPattern', 'cross');
        });
        await act(async () => {
          prefs.current.updatePreference('snapToGrid', false);
        });
        await act(async () => {
          prefs.current.updatePreference('defaultZoom', 150);
        });
        await act(async () => {
          prefs.current.updatePreference('language', 'en');
        });
        await act(async () => {
          prefs.current.updatePreference('smartGuides', true);
        });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN a single save merges every change', () => {
        expect(upsertPreferences).toHaveBeenCalledExactlyOnceWith({
          ...PREFERENCES,
          canvasPattern: 'cross',
          snapToGrid: false,
          defaultZoom: 150,
          language: 'en',
          smartGuides: true,
        });
      });

      test('THEN the document attributes follow the changes', () => {
        expect(document.documentElement.getAttribute('data-canvas-pattern')).toBe('cross');
        expect(document.documentElement.getAttribute('data-snap-to-grid')).toBe('false');
        expect(document.documentElement.getAttribute('data-default-zoom')).toBe('150');
        expect(document.documentElement.getAttribute('data-smart-guides')).toBe('true');
      });
    });

    describe('WHEN a preference is set to its current value', () => {
      let before: IPreferences;

      beforeEach(async () => {
        before = prefs.current.preferences;
        await act(async () => {
          prefs.current.updatePreference('theme', PREFERENCES.theme);
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN the state keeps its identity and nothing saves', () => {
        expect(prefs.current.preferences).toBe(before);
        expect(upsertPreferences).not.toHaveBeenCalled();
      });
    });

    describe('WHEN the hook unmounts before the debounce elapses', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
        });
        unmountPrefs();
        await act(async () => {
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN the pending save never reaches the api', () => {
        expect(upsertPreferences).not.toHaveBeenCalled();
      });
    });
  });

  describe('GIVEN a remote load that fails on the api', () => {
    beforeEach(async () => {
      vi.mocked(getPreferences).mockRejectedValue(new Error('db down'));

      prefs = renderHook(() => usePreferences()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the failure settles', () => {
      test('THEN the defaults stay and the failure stays toastless', () => {
        expect(prefs.current.preferences).toEqual(DEFAULT_PREFERENCES);
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          toast: false,
          context: 'preferences.load',
        });
      });
    });
  });

  describe('GIVEN a save that fails on the api', () => {
    beforeEach(async () => {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(PREFERENCES));
      vi.mocked(getPreferences).mockResolvedValue(null);
      vi.mocked(upsertPreferences).mockRejectedValue(new Error('db down'));

      prefs = renderHook(() => usePreferences()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN a changed preference saves after the debounce', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN the change rolls back everywhere', () => {
        expect(prefs.current.preferences).toEqual(PREFERENCES);
        expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)!)).toEqual(PREFERENCES);
        expect(document.documentElement.getAttribute('data-theme')).toBe('eclipse');
      });

      test('THEN the failure surfaces with the localized title', () => {
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.saveFailed,
          context: 'preferences.save',
        });
      });
    });
  });

  describe('GIVEN a save still in flight when the same key changes again', () => {
    let rejectSave: (reason: Error) => void;

    beforeEach(async () => {
      const inFlightSave = Promise.withResolvers<void>();

      rejectSave = inFlightSave.reject;
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(PREFERENCES));
      vi.mocked(getPreferences).mockResolvedValue(null);
      vi.mocked(upsertPreferences).mockResolvedValue(undefined);
      vi.mocked(upsertPreferences).mockReturnValueOnce(inFlightSave.promise);

      prefs = renderHook(() => usePreferences()).result;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });
    });

    describe('WHEN the stale save fails after the newer change', () => {
      beforeEach(async () => {
        await act(async () => {
          prefs.current.updatePreference('theme', 'graphite');
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
        await act(async () => {
          prefs.current.updatePreference('theme', 'solstice');
        });
        await act(async () => {
          rejectSave(new Error('db down'));
          await vi.advanceTimersByTimeAsync(PREFERENCES_DEBOUNCE_MS);
        });
      });

      test('THEN the newer value survives the stale failure', () => {
        expect(prefs.current.preferences.theme).toBe('solstice');
        expect(JSON.parse(localStorage.getItem(PREFERENCES_STORAGE_KEY)!)).toEqual({
          ...PREFERENCES,
          theme: 'solstice',
        });
      });

      test('THEN the failure surfaces once and the newer save persists', () => {
        expect(upsertPreferences).toHaveBeenCalledTimes(2);
        expect(upsertPreferences).toHaveBeenLastCalledWith({ ...PREFERENCES, theme: 'solstice' });
        expect(event.error).toHaveBeenCalledExactlyOnceWith(expect.any(Error), {
          title: TRANSLATIONS.common.errorTitles.saveFailed,
          context: 'preferences.save',
        });
      });
    });
  });
});
