import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';

import { ACCOUNT_NAME, ACCOUNT_PLAN } from './consts.mjs';
import { createCredentials, readLocalSupabase } from './utils/supabase.mjs';

const stop = (message) => {
  console.error(message);
  process.exit(1);
};

const { url, key, error } = readLocalSupabase(readFileSync(0, 'utf8'));

if (error) stop(error);

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const credentials = createCredentials(randomBytes(4).toString('hex'));

const created = await admin.auth.admin.createUser({
  ...credentials,
  email_confirm: true,
  user_metadata: { name: ACCOUNT_NAME, plan: ACCOUNT_PLAN },
});

if (created.error || !created.data.user) stop(`Could not create the account: ${created.error?.message}`);

const onboarding = await admin
  .from('user_onboarding')
  .upsert({ user_id: created.data.user.id, offer_answered: true, completed_guides: [] });

if (onboarding.error) stop(`Could not answer the tour offer: ${onboarding.error.message}`);

process.stdout.write(`${JSON.stringify(credentials)}\n`);
