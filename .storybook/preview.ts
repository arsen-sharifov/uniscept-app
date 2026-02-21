import type { Preview } from '@storybook/nextjs-vite';

import '../src/app/globals.css';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
        color: /(color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: ['Docs', 'Components'],
      },
    },
  },
};

export default preview;
