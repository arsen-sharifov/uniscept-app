import { PROMPT_EVENT, TOOL_EVENT } from '../consts/hooks.mjs';
import { ASK_PREFIX, BLOCKED_PREFIX } from '../consts/messages.mjs';

export const deliverToClaude = (result, event) => {
  const { decision, reason } = result;

  if (decision === 'ask') {
    return {
      output: {
        hookSpecificOutput: {
          hookEventName: TOOL_EVENT,
          permissionDecision: 'ask',
          permissionDecisionReason: `${ASK_PREFIX} ${reason}`,
        },
      },
    };
  }
  if (event === PROMPT_EVENT) {
    return {
      output: {
        decision: 'block',
        reason: `${BLOCKED_PREFIX} ${reason}`,
        hookSpecificOutput: { hookEventName: PROMPT_EVENT, suppressOriginalPrompt: true },
      },
    };
  }

  return { error: `${BLOCKED_PREFIX} ${reason}` };
};
