import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import {
  APPROVAL_EXIT_STATUSES,
  APPROVAL_INPUT,
  ASK_OUTPUT,
  BLOCKED_HOOK_INPUTS,
  BLOCKED_STATUS,
  BROKEN_GUARD_PREFIX,
  BROKEN_MODULE,
  BROKEN_MODULE_SOURCE,
  CODEX_HOOK_PROCESS,
  CODEX_PROMPT_BLOCK_OUTPUT,
  CODEX_PROMPT_HOOK,
  CODEX_TOOL_HOOK,
  DENY_OUTPUT,
  FORBIDDEN_INPUT,
  FORBIDDEN_REASON,
  GUARD_ADAPTERS,
  GUARD_FILE,
  GUARD_PROCESS,
  GUARD_SCRIPT,
  HOOKS_DIRECTORY,
  LOCAL_READ_INPUT,
  OUTSIDE_REPOSITORY,
  PROMPT_BLOCK_OUTPUT,
  PROMPT_SECRET,
  REPOSITORY_SUBDIRECTORY,
  SECRET_PROMPT_INPUT,
  WRAPPER_FAILURE,
} from '@mocks/assistantGuard';

describe('guard', () => {
  describe.each(GUARD_ADAPTERS)('GIVEN the %s adapter', (adapter) => {
    describe.each(BLOCKED_HOOK_INPUTS)('WHEN the hook input is $name', ({ input }) => {
      let status: number | null;

      beforeEach(() => {
        status = spawnSync(process.execPath, [GUARD_SCRIPT, adapter], { ...GUARD_PROCESS, input }).status;
      });

      test('THEN the tool call is blocked', () => {
        expect(status).toBe(BLOCKED_STATUS);
      });
    });
  });

  describe('GIVEN the claude adapter', () => {
    describe('WHEN a call needs approval', () => {
      let output: string;

      beforeEach(() => {
        output = spawnSync(process.execPath, [GUARD_SCRIPT, 'claude'], {
          ...GUARD_PROCESS,
          input: JSON.stringify(APPROVAL_INPUT),
        }).stdout;
      });

      test('THEN the hook asks the person', () => {
        expect(JSON.parse(output)).toMatchObject(ASK_OUTPUT);
      });
    });

    describe('WHEN a prompt carries a secret', () => {
      let output: string;

      beforeEach(() => {
        output = spawnSync(process.execPath, [GUARD_SCRIPT, 'claude'], {
          ...GUARD_PROCESS,
          input: JSON.stringify(SECRET_PROMPT_INPUT),
        }).stdout;
      });

      test('THEN the hook blocks the prompt without repeating it', () => {
        expect(JSON.parse(output)).toMatchObject(PROMPT_BLOCK_OUTPUT);
      });

      test('THEN the block message leaves the secret out', () => {
        expect(output).not.toContain(PROMPT_SECRET);
      });
    });
  });

  describe.each(APPROVAL_EXIT_STATUSES)(
    'GIVEN the $adapter adapter where $situation',
    ({ adapter, input, status: expected }) => {
      describe('WHEN a call needs approval', () => {
        let status: number | null;

        beforeEach(() => {
          status = spawnSync(process.execPath, [GUARD_SCRIPT, adapter], {
            ...GUARD_PROCESS,
            input: JSON.stringify(input),
          }).status;
        });

        test('THEN the hook lets the assistant prompt or blocks the call', () => {
          expect(status).toBe(expected);
        });
      });
    },
  );

  describe('GIVEN an unknown adapter', () => {
    describe('WHEN a call arrives', () => {
      let status: number | null;

      beforeEach(() => {
        status = spawnSync(process.execPath, [GUARD_SCRIPT, 'unknown'], {
          ...GUARD_PROCESS,
          input: JSON.stringify(LOCAL_READ_INPUT),
        }).status;
      });

      test('THEN the tool call is blocked', () => {
        expect(status).toBe(BLOCKED_STATUS);
      });
    });
  });

  describe('GIVEN a guard module that cannot load', () => {
    let directory: string;

    beforeEach(() => {
      directory = mkdtempSync(BROKEN_GUARD_PREFIX);
      cpSync(HOOKS_DIRECTORY, directory, { recursive: true });
      writeFileSync(join(directory, BROKEN_MODULE), BROKEN_MODULE_SOURCE);
    });

    afterEach(() => {
      rmSync(directory, { recursive: true, force: true });
    });

    describe.each(GUARD_ADAPTERS)('WHEN the %s adapter checks a call', (adapter) => {
      let status: number | null;

      beforeEach(() => {
        status = spawnSync(process.execPath, [join(directory, GUARD_FILE), adapter], {
          ...GUARD_PROCESS,
          input: JSON.stringify(LOCAL_READ_INPUT),
        }).status;
      });

      test('THEN the tool call is blocked', () => {
        expect(status).toBe(BLOCKED_STATUS);
      });
    });
  });

  describe('GIVEN the configured Codex hook', () => {
    describe('WHEN Codex starts from a repository subdirectory', () => {
      let result: { status: number | null; stdout: string };

      beforeEach(() => {
        result = spawnSync(CODEX_TOOL_HOOK, {
          ...CODEX_HOOK_PROCESS,
          cwd: REPOSITORY_SUBDIRECTORY,
          input: JSON.stringify(LOCAL_READ_INPUT),
        });
      });

      test('THEN the hook starts and exits cleanly', () => {
        expect(result.status).toBe(0);
      });

      test('THEN the hook lets the allowed call through without a decision', () => {
        expect(result.stdout).toBe('');
      });
    });

    describe('WHEN a forbidden call arrives', () => {
      let result: { status: number | null; stdout: string };

      beforeEach(() => {
        result = spawnSync(CODEX_TOOL_HOOK, { ...CODEX_HOOK_PROCESS, input: JSON.stringify(FORBIDDEN_INPUT) });
      });

      test('THEN the hook exits cleanly so no shell can turn the block into a failure', () => {
        expect(result.status).toBe(0);
      });

      test('THEN the hook denies the call in its output', () => {
        expect(JSON.parse(result.stdout)).toMatchObject(DENY_OUTPUT);
      });

      test('THEN the denial names the project rule, not a failure of the hook', () => {
        expect(JSON.parse(result.stdout).hookSpecificOutput.permissionDecisionReason).toContain(FORBIDDEN_REASON);
      });
    });

    describe('WHEN a prompt carries a secret', () => {
      let result: { status: number | null; stdout: string };

      beforeEach(() => {
        result = spawnSync(CODEX_PROMPT_HOOK, { ...CODEX_HOOK_PROCESS, input: JSON.stringify(SECRET_PROMPT_INPUT) });
      });

      test('THEN the hook exits cleanly so no shell can turn the block into a failure', () => {
        expect(result.status).toBe(0);
      });

      test('THEN the hook blocks the prompt in its output', () => {
        expect(JSON.parse(result.stdout)).toMatchObject(CODEX_PROMPT_BLOCK_OUTPUT);
      });
    });

    describe('WHEN Codex runs outside any repository, so the guard cannot be found', () => {
      let output: string;

      beforeEach(() => {
        output = spawnSync(CODEX_TOOL_HOOK, {
          ...CODEX_HOOK_PROCESS,
          cwd: OUTSIDE_REPOSITORY,
          input: JSON.stringify(LOCAL_READ_INPUT),
        }).stdout;
      });

      test('THEN the hook denies the call instead of letting it through', () => {
        expect(JSON.parse(output)).toMatchObject(DENY_OUTPUT);
      });

      test('THEN the denial says the guard could not start', () => {
        expect(JSON.parse(output).hookSpecificOutput.permissionDecisionReason).toContain(WRAPPER_FAILURE);
      });
    });
  });
});
