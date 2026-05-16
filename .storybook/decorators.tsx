import { useEffect } from 'react';
import type { Decorator } from '@storybook/nextjs-vite';
import { ReactFlowProvider } from '@xyflow/react';
import type { IMockCanvasState } from '@story-interfaces';
import { mockCanvasStore, resetCanvasStore } from './utils';

export const WithPad: Decorator = (Story) => (
  <div className="flex min-h-screen w-full items-center justify-center p-12">
    <Story />
  </div>
);

export const WithPadTop: Decorator = (Story) => (
  <div className="flex min-h-screen w-full justify-center px-8 py-16">
    <Story />
  </div>
);

export const WithCanvasStage: Decorator = (Story) => (
  <div className="relative h-screen w-screen overflow-hidden">
    <Story />
  </div>
);

export const WithReactFlow: Decorator = (Story) => (
  <ReactFlowProvider>
    <Story />
  </ReactFlowProvider>
);

export const withCanvasStore = (state: IMockCanvasState = {}): Decorator =>
  function WithCanvasStore(Story) {
    useEffect(() => {
      mockCanvasStore(state);

      return resetCanvasStore;
    }, []);

    return <Story />;
  };
