import type { TCanvasOperation } from '@interfaces';

type TCanvasOperationListener = (operation: TCanvasOperation) => void;

const listeners = new Set<TCanvasOperationListener>();

export const emitCanvasOperation = (operation: TCanvasOperation): void => {
  listeners.forEach((listener) => listener(operation));
};

export const subscribeCanvasOperations = (listener: TCanvasOperationListener): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
