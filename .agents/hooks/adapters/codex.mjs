import { NATIVE_PROMPT_MODES, PLAIN_SCRIPT } from '../consts/codex.mjs';
import { BLOCKED_PREFIX, CODEX_HINTS } from '../consts/messages.mjs';
import { findApprovalMode, readPromptRules } from '../utils/codex.mjs';

const isPromptedCommand = ({ tokens, isHidden }, rules) =>
  !isHidden &&
  rules.some((pattern) => pattern.every((alternatives, index) => [alternatives].flat().includes(tokens[index])));

const hasNativeApproval = ({ kind, script = '', commands = [], server, tool }) => {
  if (kind === 'integration') return NATIVE_PROMPT_MODES.includes(findApprovalMode({ server, tool }));
  if (commands.length === 0 || !PLAIN_SCRIPT.test(script)) return false;

  const rules = readPromptRules();

  return commands.every((command) => isPromptedCommand(command, rules));
};

export const deliverToCodex = (result) => {
  const { decision, reason, approval } = result;

  if (decision === 'deny') return { error: `${BLOCKED_PREFIX} ${reason}` };

  return hasNativeApproval(approval) ? {} : { error: `${BLOCKED_PREFIX} ${reason} ${CODEX_HINTS[approval.kind]}` };
};
