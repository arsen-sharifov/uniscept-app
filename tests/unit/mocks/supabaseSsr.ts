import { vi } from 'vitest';

export const createServerClient = vi.fn();

export const createBrowserClient = vi.fn();

export const ssrAuth = { getUser: vi.fn(), exchangeCodeForSession: vi.fn() };

const REFRESHED_SESSION_COOKIE = { name: 'sb-session', value: 'fresh', options: { path: '/' } };

export const primeSsrSession = ({
  user = null,
  exchangeError = null,
  refreshesSession = false,
}: {
  user?: { id: string } | null;
  exchangeError?: Error | null;
  refreshesSession?: boolean;
}) => {
  vi.mocked(createServerClient).mockImplementation(
    (_url: string, _key: string, config: { cookies: { setAll: (cookies: unknown[]) => void } }) => {
      const storeRefreshedSession = () => config.cookies.setAll([REFRESHED_SESSION_COOKIE]);

      ssrAuth.getUser.mockImplementation(async () => {
        if (refreshesSession) storeRefreshedSession();

        return { data: { user } };
      });
      ssrAuth.exchangeCodeForSession.mockImplementation(async () => {
        storeRefreshedSession();

        return { error: exchangeError };
      });

      return { auth: ssrAuth };
    },
  );
};
