import type { TCanvasAuthors } from '@interfaces';

export const ARG_CATEGORIES = {
  CONTENT: 'Content',
  BEHAVIOR: 'Behavior',
  APPEARANCE: 'Appearance',
  STATE: 'State',
  OTHER: 'Other',
} as const;

export const COPY_FEEDBACK_DELAY_MS = 900;

export const STORYBOOK_AUTHOR_ID = 'storybook-user';

export const STORYBOOK_OTHER_AUTHOR_ID = 'sb-other';

export const STORYBOOK_CREATED_AT = '2025-09-14T10:24:00.000Z';

export const STORYBOOK_EDITED_AT = '2025-09-16T08:05:00.000Z';

export const STORYBOOK_AUTHORS: TCanvasAuthors = {
  [STORYBOOK_AUTHOR_ID]: { name: 'Dana Park', avatarIcon: null },
  [STORYBOOK_OTHER_AUTHOR_ID]: { name: 'Ilya Moroz', avatarIcon: 'panda' },
};
