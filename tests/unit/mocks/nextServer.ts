import { vi } from 'vitest';

export const after = vi.fn<(task: () => Promise<void>) => void>();

export const runAfterResponse = async (): Promise<void> => {
  await Promise.all(after.mock.calls.map(([task]) => task()));
};
