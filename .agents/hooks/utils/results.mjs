export const deny = (reason) => ({ decision: 'deny', reason });

export const ask = (reason, approval) => ({ decision: 'ask', reason, approval });
