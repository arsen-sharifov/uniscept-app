import { vi } from 'vitest';

export const getAdminClient = vi.fn();

export const primeAdminClient = () => {
  const rpc = vi.fn(
    async (_name: string, _params?: Record<string, unknown>): Promise<{ data: unknown; error: unknown }> => ({
      data: null,
      error: null,
    }),
  );
  const deleteAllowance = vi.fn(
    async (_column: string, _value: string): Promise<{ data: unknown; error: unknown }> => ({
      data: null,
      error: null,
    }),
  );
  const from = vi.fn((_table: string) => ({ delete: () => ({ eq: deleteAllowance }) }));
  const deleteUser = vi.fn(async (_id: string): Promise<{ data: unknown; error: unknown }> => ({
    data: {},
    error: null,
  }));
  const inviteUserByEmail = vi.fn(
    async (
      _email: string,
      _options: { redirectTo: string; data: Record<string, string> },
    ): Promise<{ data: unknown; error: unknown }> => ({ data: {}, error: null }),
  );

  vi.mocked(getAdminClient).mockReturnValue({ rpc, from, auth: { admin: { deleteUser, inviteUserByEmail } } } as never);

  return { rpc, from, deleteAllowance, deleteUser, inviteUserByEmail };
};
