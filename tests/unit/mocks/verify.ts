export const LOCAL_SUPABASE = { url: 'http://127.0.0.1:54321', key: 'local-secret-key' };

export const LOCAL_STATUS = `Starting containers...\n${JSON.stringify({
  API_URL: LOCAL_SUPABASE.url,
  SECRET_KEY: LOCAL_SUPABASE.key,
  SERVICE_ROLE_KEY: 'local-service-role-key',
})}`;

const REMOTE_URL = 'https://project.example.com';

export const REMOTE_STATUS = JSON.stringify({ API_URL: REMOTE_URL, SECRET_KEY: 'remote-secret-key' });

export const REMOTE_STATUS_ERROR = `Accounts are created only on the local Supabase, not on ${REMOTE_URL}.`;

export const STOPPED_STATUS = '';

export const BROKEN_STATUS = '{ "API_URL": ';

export const STOPPED_STATUS_ERROR = 'The local Supabase is not running. Start it with pnpm db:start.';

export const ACCOUNT_SUFFIX = 'a1b2c3d4';

export const VERIFIER_CREDENTIALS = {
  email: 'verifier-a1b2c3d4@verify.uniscept.test',
  password: 'Verify-a1b2c3d4-1!',
};
