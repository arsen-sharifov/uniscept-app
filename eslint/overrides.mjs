import { E2E_FILES, STORYBOOK_FILES } from './consts.mjs';

export const storybookOverride = {
  files: STORYBOOK_FILES,
  rules: {
    'react/function-component-definition': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
};

export const declarationFilesOverride = {
  files: ['**/*.d.ts'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};

export const e2eFixturesOverride = {
  files: E2E_FILES,
  rules: { 'react-hooks/rules-of-hooks': 'off' },
};

export const useTranslationsWrapperOverride = {
  files: ['src/i18n/hooks/useTranslations.ts'],
  rules: { 'no-restricted-imports': 'off' },
};
