import { vi } from 'vitest';

export const cookieStore = { get: vi.fn(), getAll: vi.fn(), set: vi.fn(), delete: vi.fn() };

export const cookies = vi.fn(async () => cookieStore);

export const headers = vi.fn();

export const REQUEST_COOKIES = [{ name: 'sb-session', value: 'current' }];
