import { vi } from 'vitest';

import type { TToast } from '@interfaces';

export { useToastStore } from '@/lib/events/stores';

export const event = {
  error: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
};

export const reportError = vi.fn();

export const BOOM_ERROR = new Error('boom');

export const RENDER_ERROR = new Error('render failed');

export const BOUNDARY_REPORT = { title: 'Could not show this part', context: 'test.boundary' };

export const LAYOUT_ERROR = new Error('layout failed');

export const DIGEST_ROUTE_ERROR = Object.assign(new Error('route failed'), { digest: 'digest-1' });

export const TOAST_DURATION_MS = 5000;

export const SAVED_TOAST: TToast = {
  id: 'toast-1',
  type: 'success',
  title: 'Saved',
  message: 'The thread is saved.',
  duration: TOAST_DURATION_MS,
};
