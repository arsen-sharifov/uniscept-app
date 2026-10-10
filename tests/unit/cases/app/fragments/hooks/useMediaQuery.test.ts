import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { stubMediaQueries } from '@mocks/browser';
import { DESKTOP_QUERY } from '@/app/fragments/consts';
import { useMediaQuery } from '@/app/fragments/hooks';

let media: ReturnType<typeof stubMediaQueries>;
let matches: { current: boolean };

beforeEach(() => {
  media = stubMediaQueries();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
  describe('GIVEN a narrow window', () => {
    beforeEach(() => {
      matches = renderHook(() => useMediaQuery(DESKTOP_QUERY)).result;
    });

    describe('WHEN it renders', () => {
      test('THEN the query does not match', () => {
        expect(matches.current).toBe(false);
      });
    });

    describe('WHEN the window widens past the query', () => {
      beforeEach(() => {
        act(() => media.change(DESKTOP_QUERY, true));
      });

      test('THEN the query matches', () => {
        expect(matches.current).toBe(true);
      });
    });
  });

  describe('GIVEN a wide window', () => {
    beforeEach(() => {
      media.change(DESKTOP_QUERY, true);
    });

    describe('WHEN the hook renders on the server', () => {
      let serverMatches: boolean | null = null;

      beforeEach(() => {
        renderToString(
          createElement(() => {
            serverMatches = useMediaQuery(DESKTOP_QUERY);

            return null;
          }),
        );
      });

      test('THEN it does not match until the client measures', () => {
        expect(serverMatches).toBe(false);
      });
    });
  });
});
