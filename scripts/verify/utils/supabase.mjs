import { ACCOUNT_DOMAIN, LOCAL_URL, STATUS_JSON } from '../consts.mjs';

const parseStatus = (text) => {
  try {
    return JSON.parse(STATUS_JSON.exec(text)?.[0]);
  } catch {
    return null;
  }
};

export const readLocalSupabase = (statusText) => {
  const status = parseStatus(statusText);
  const url = status?.API_URL;
  const key = status?.SECRET_KEY;

  if (!url || !key) return { error: 'The local Supabase is not running. Start it with pnpm db:start.' };
  if (!LOCAL_URL.test(url)) return { error: `Accounts are created only on the local Supabase, not on ${url}.` };

  return { url, key };
};

export const createCredentials = (suffix) => ({
  email: `verifier-${suffix}@${ACCOUNT_DOMAIN}`,
  password: `Verify-${suffix}-1!`,
});
