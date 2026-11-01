import { resolve } from 'node:path';

export const PROJECT_DIRECTORY = resolve(import.meta.dirname, '../../..');
export const BLOCKED_EXIT_CODE = 2;
export const TOOL_EVENT = 'PreToolUse';
export const PROMPT_EVENT = 'UserPromptSubmit';
export const PROMPT_TOKEN = /[\w.-]{19,}[\w-]/g;
export const AUTOMATIC_PROMPT =
  /^\s*(?:Another Claude session sent a message:|<task-notification>|<cross-session-message\b|<agent-message\b)/;
