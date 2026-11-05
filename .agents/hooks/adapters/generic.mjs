import { BLOCKED_PREFIX, GENERIC_HINT } from '../consts/messages.mjs';

export const deliverToGeneric = (result) => {
  const { decision, reason } = result;

  return { error: decision === 'ask' ? `${BLOCKED_PREFIX} ${reason} ${GENERIC_HINT}` : `${BLOCKED_PREFIX} ${reason}` };
};
