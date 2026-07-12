import { SOURCE_FILES } from './consts.mjs';

export const typescriptRules = {
  files: SOURCE_FILES,
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: true },
    ],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/naming-convention': [
      'error',
      { selector: 'interface', format: ['PascalCase'], custom: { regex: '^I[A-Z]', match: true } },
      { selector: 'typeAlias', format: ['PascalCase'], custom: { regex: '^T[A-Z]', match: true } },
      { selector: 'enum', format: ['PascalCase'], custom: { regex: '^E[A-Z]', match: true } },
      { selector: 'parameter', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
    ],
  },
};
