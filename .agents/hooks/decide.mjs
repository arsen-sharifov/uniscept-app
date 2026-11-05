import { checkBrowser } from './checks/browser.mjs';
import { checkCommands } from './checks/commands.mjs';
import { checkFiles } from './checks/files.mjs';
import { checkIntegrations } from './checks/integrations.mjs';
import { checkPrompt } from './checks/prompt.mjs';
import { PROMPT_EVENT } from './consts/hooks.mjs';
import { readToolCall } from './utils/toolCall.mjs';

export const decide = (input) => {
  if (input?.hook_event_name === PROMPT_EVENT) return checkPrompt(input);

  const call = readToolCall(input);

  return checkIntegrations(call) ?? checkFiles(call) ?? checkBrowser(call) ?? checkCommands(call);
};
