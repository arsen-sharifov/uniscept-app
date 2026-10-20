import { vi } from 'vitest';

export const preloadRichTextEditor = vi.fn(() => Promise.resolve());

export const RichTextEditor = vi.fn(() => null);

export const PRELOAD_ERROR = new Error('The editor chunk could not be preloaded');
