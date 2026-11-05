import { beforeEach, describe, expect, test } from 'vitest';

import { CODEX_DECISIONS, FORBIDDEN_INPUT, FORBIDDEN_REASON } from '@mocks/assistantGuard';

import { deliverToCodex } from '../../../../../../.agents/hooks/adapters/codex.mjs';
import { decide } from '../../../../../../.agents/hooks/decide.mjs';

describe('deliverToCodex', () => {
  describe('GIVEN a call the project limits hold for approval', () => {
    describe.each(CODEX_DECISIONS)('WHEN $name', ({ input, expected }) => {
      let isBlocked: boolean;

      beforeEach(() => {
        isBlocked = 'error' in deliverToCodex(decide(input));
      });

      test(`THEN Codex ${expected.codex} before the call runs`, () => {
        expect(isBlocked).toBe(expected.codex === 'blocks');
      });
    });
  });

  describe('GIVEN a call the project limits forbid', () => {
    describe('WHEN it reaches Codex', () => {
      let delivered: { error?: string };

      beforeEach(() => {
        delivered = deliverToCodex(decide(FORBIDDEN_INPUT));
      });

      test('THEN the call is blocked with the rule that forbids it', () => {
        expect(delivered.error).toContain(FORBIDDEN_REASON);
      });
    });
  });
});
