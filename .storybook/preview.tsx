import type { Decorator, Preview } from '@storybook/nextjs-vite';
import { NextIntlClientProvider } from 'next-intl';

import type { TTheme } from '@constants';

import en from '../src/locales/en.json';
import '../src/app/globals.css';

const THEME_OPTIONS: { value: TTheme; title: string }[] = [
  { value: 'daybreak', title: 'Daybreak' },
  { value: 'eclipse', title: 'Eclipse' },
  { value: 'graphite', title: 'Graphite' },
  { value: 'solstice', title: 'Solstice' },
  { value: 'aurora', title: 'Aurora' },
  { value: 'auto', title: 'Auto' },
];

const IntlDecorator: Decorator = (Story) => (
  <NextIntlClientProvider locale="en" messages={en}>
    <Story />
  </NextIntlClientProvider>
);

const ThemeDecorator: Decorator = (Story, context) => {
  const theme = (context.globals.theme as TTheme) || 'daybreak';
  const inStory = context.viewMode !== 'docs';

  return (
    <div
      data-theme={theme}
      className={
        inStory
          ? 'min-h-screen w-full bg-[color:var(--app-bg)] text-[color:var(--text)]'
          : 'rounded-xl border border-[color:var(--border)] bg-[color:var(--app-bg)] p-4 text-[color:var(--text)]'
      }
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [ThemeDecorator, IntlDecorator],
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Active Uniscept theme',
      defaultValue: 'daybreak',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEME_OPTIONS,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
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
        order: [
          'Foundations',
          ['Colors', 'Typography', 'Themes', 'Patterns & Effects'],
          'Branding',
          'Components',
          ['Canvas', 'CanvasNode', 'ReferenceNode', 'ContextMenu', 'ReferenceSearchPanel', '*'],
        ],
      },
    },
  },
};

export default preview;
