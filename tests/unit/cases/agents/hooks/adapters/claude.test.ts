import { beforeEach, describe, expect, test } from 'vitest';

import {
  APPROVAL_INPUT,
  ASK_OUTPUT,
  FORBIDDEN_INPUT,
  FORBIDDEN_REASON,
  PROMPT_BLOCK_OUTPUT,
  SECRET_PROMPT_INPUT,
} from '@mocks/assistantGuard';

import { deliverToClaude } from '../../../../../../.agents/hooks/adapters/claude.mjs';
import { decide } from '../../../../../../.agents/hooks/decide.mjs';

describe('deliverToClaude', () => {
  describe('GIVEN a call that needs approval', () => {
    describe('WHEN it reaches Claude Code', () => {
      let delivered: object;

      beforeEach(() => {
        delivered = deliverToClaude(decide(APPROVAL_INPUT));
      });

      test('THEN Claude Code asks the person', () => {
        expect(delivered).toMatchObject({ output: ASK_OUTPUT });
      });
    });
  });

  describe('GIVEN a call the project limits forbid', () => {
    describe('WHEN it reaches Claude Code', () => {
      let delivered: { error?: string };

      beforeEach(() => {
        delivered = deliverToClaude(decide(FORBIDDEN_INPUT));
      });

      test('THEN the call is blocked with the rule that forbids it', () => {
        expect(delivered.error).toContain(FORBIDDEN_REASON);
      });
    });
  });

  describe('GIVEN a prompt that carries a secret', () => {
    describe('WHEN it reaches Claude Code', () => {
      let delivered: object;

      beforeEach(() => {
        delivered = deliverToClaude(decide(SECRET_PROMPT_INPUT), SECRET_PROMPT_INPUT.hook_event_name);
      });

      test('THEN the prompt is blocked without being repeated', () => {
        expect(delivered).toMatchObject({ output: PROMPT_BLOCK_OUTPUT });
      });
    });
  });
});
