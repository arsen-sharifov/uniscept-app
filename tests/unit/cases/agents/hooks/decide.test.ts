import { beforeEach, describe, expect, test } from 'vitest';

import { GUARD_DECISIONS } from '@mocks/assistantGuard';

import { decide } from '../../../../../.agents/hooks/decide.mjs';

describe('decide', () => {
  describe('GIVEN the project limits', () => {
    describe.each(GUARD_DECISIONS)('WHEN $name', ({ input, expected }) => {
      let decision: string;

      beforeEach(() => {
        decision = decide(input)?.decision ?? 'allow';
      });

      test(`THEN the guard answers ${expected.decision}`, () => {
        expect(decision).toBe(expected.decision);
      });
    });
  });
});
