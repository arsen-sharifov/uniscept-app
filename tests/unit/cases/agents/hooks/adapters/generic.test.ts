import { beforeEach, describe, expect, test } from 'vitest';

import { APPROVAL_INPUT, FORBIDDEN_INPUT, FORBIDDEN_REASON } from '@mocks/assistantGuard';

import { deliverToGeneric } from '../../../../../../.agents/hooks/adapters/generic.mjs';
import { decide } from '../../../../../../.agents/hooks/decide.mjs';

describe('deliverToGeneric', () => {
  describe('GIVEN a call that needs approval', () => {
    describe('WHEN it reaches an assistant that cannot ask', () => {
      let delivered: { error?: string };

      beforeEach(() => {
        delivered = deliverToGeneric(decide(APPROVAL_INPUT));
      });

      test('THEN the call is blocked', () => {
        expect(delivered).toHaveProperty('error');
      });
    });
  });

  describe('GIVEN a call the project limits forbid', () => {
    describe('WHEN it reaches an assistant that cannot ask', () => {
      let delivered: { error?: string };

      beforeEach(() => {
        delivered = deliverToGeneric(decide(FORBIDDEN_INPUT));
      });

      test('THEN the call is blocked with the rule that forbids it', () => {
        expect(delivered.error).toContain(FORBIDDEN_REASON);
      });
    });
  });
});
