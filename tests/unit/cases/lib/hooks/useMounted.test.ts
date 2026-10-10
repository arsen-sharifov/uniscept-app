import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, test } from 'vitest';

import { useMounted } from '@hooks';

let mounted: boolean | null;

describe('useMounted', () => {
  describe('GIVEN a client environment', () => {
    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        mounted = renderHook(() => useMounted()).result.current;
      });

      test('THEN it reports mounted', () => {
        expect(mounted).toBe(true);
      });
    });
  });

  describe('GIVEN a server render', () => {
    describe('WHEN the hook renders', () => {
      beforeEach(() => {
        mounted = null;
        renderToString(
          createElement(() => {
            mounted = useMounted();

            return null;
          }),
        );
      });

      test('THEN it reports not mounted', () => {
        expect(mounted).toBe(false);
      });
    });
  });
});
