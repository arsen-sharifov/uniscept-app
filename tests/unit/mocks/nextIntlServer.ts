import { vi } from 'vitest';

export const getRequestConfig = <TFactory>(factory: TFactory) => factory;

export const getLocale = vi.fn();

export const getMessages = vi.fn();
