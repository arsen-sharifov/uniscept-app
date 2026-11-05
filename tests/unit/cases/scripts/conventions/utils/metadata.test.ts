import { beforeEach, describe, expect, test } from 'vitest';

import { ACCEPTED_PULL_REQUESTS, INVALID_PULL_REQUESTS, VALID_PULL_REQUEST } from '@mocks/conventions';

import { getPullRequestErrors } from '../../../../../../scripts/conventions/utils/metadata.mjs';

describe('getPullRequestErrors', () => {
  describe('GIVEN consistent issue metadata', () => {
    describe.each(ACCEPTED_PULL_REQUESTS)('WHEN $name', ({ change }) => {
      let errors: unknown[];

      beforeEach(() => {
        errors = getPullRequestErrors({ ...VALID_PULL_REQUEST, ...change });
      });

      test('THEN the metadata passes', () => {
        expect(errors).toEqual([]);
      });
    });
  });

  describe('GIVEN inconsistent issue metadata', () => {
    describe.each(INVALID_PULL_REQUESTS)('WHEN $name', ({ change, error }) => {
      let errors: unknown[];

      beforeEach(() => {
        errors = getPullRequestErrors({ ...VALID_PULL_REQUEST, ...change });
      });

      test('THEN the matching rule rejects it', () => {
        expect(errors).toEqual([error]);
      });
    });
  });
});
