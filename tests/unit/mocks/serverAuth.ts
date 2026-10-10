import { vi } from 'vitest';

export const verifyPassword = vi.fn();

export const WRONG_PASSWORD = { error: { code: 'invalid_credentials', status: 400 } };
