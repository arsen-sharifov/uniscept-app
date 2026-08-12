import { getSupabaseEnv } from './utils';

const setup = async () => {
  const { url, anonKey, serviceRoleKey } = getSupabaseEnv();

  if (!/^https?:\/\/(localhost|127\.0\.0\.1)([:/]|$)/.test(url)) {
    throw new Error(`Refusing to run the integration suite against a non-local Supabase at ${url}.`);
  }

  const response = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anonKey } }).catch(() => null);

  if (!response?.ok) {
    throw new Error(`Local Supabase is not reachable at ${url}. Start it with \`pnpm db:start\`.`);
  }

  const probe = await fetch(`${url}/rest/v1/workspaces?select=id&limit=1`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
  }).catch(() => null);

  if (!probe?.ok) {
    const detail = probe ? await probe.text() : 'no response';

    throw new Error(`The service role key cannot read public.workspaces: ${detail}. Run \`pnpm db:reset\`.`);
  }
};

export default setup;
