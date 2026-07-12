import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

const storageStore = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    get length() {
      return storageStore.size;
    },
    clear: () => storageStore.clear(),
    getItem: (key: string) => storageStore.get(key) ?? null,
    key: (index: number) => [...storageStore.keys()][index] ?? null,
    removeItem: (key: string) => {
      storageStore.delete(key);
    },
    setItem: (key: string, value: string) => {
      storageStore.set(key, String(value));
    },
  },
});

afterEach(cleanup);
