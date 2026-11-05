import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';

import { AUTOMATIC_PROMPT, PROMPT_TOKEN } from '../consts/hooks.mjs';
import { INVALID_PROMPT, PROMPT_SECRET } from '../consts/messages.mjs';
import { LOCAL_SUPABASE_ISSUER, LOCAL_SUPABASE_KEY_HASHES, PROMPT_SECRETS } from '../rules.mjs';
import { deny } from '../utils/results.mjs';

const readClaims = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};

const isLocalDefault = (token) =>
  LOCAL_SUPABASE_KEY_HASHES.includes(createHash('sha256').update(token).digest('hex')) ||
  readClaims(token)?.iss === LOCAL_SUPABASE_ISSUER;

const removeLocalDefaults = (prompt) => prompt.replace(PROMPT_TOKEN, (token) => (isLocalDefault(token) ? '' : token));

const containsSecret = (prompt, { pattern, role }) =>
  role ? [...prompt.matchAll(pattern)].some(([token]) => readClaims(token)?.role === role) : pattern.test(prompt);

export const checkPrompt = ({ prompt }) => {
  if (typeof prompt !== 'string') throw new Error(INVALID_PROMPT);
  if (AUTOMATIC_PROMPT.test(prompt)) return null;

  const scannedPrompt = removeLocalDefaults(prompt);
  const secret = PROMPT_SECRETS.find((rule) => containsSecret(scannedPrompt, rule));

  return secret ? deny(`The prompt contains ${secret.name}, ${PROMPT_SECRET}`) : null;
};
