import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import storybook from 'eslint-plugin-storybook';

const SOURCE_FILES = ['**/*.{ts,tsx,mts,js,jsx,mjs}'];

const STORYBOOK_FILES = ['.storybook/**/*.{ts,tsx,mts}', '**/*.stories.{ts,tsx}'];

const restrictedImportPaths = [
  {
    name: 'react',
    importNames: ['default'],
    message: 'Use named imports from `react`.',
  },
  {
    name: 'next-intl',
    importNames: ['useMessages'],
    message:
      'Use `useTranslations` from `@hooks` for full `TTranslations`. Use next-intl `useTranslations` directly only when you need scoped reads with interpolation.',
  },
];

const restrictedImportPatterns = [
  {
    group: ['../**/lib/**', '../**/api/**'],
    message:
      'Use the matching alias (`@interfaces`, `@constants`, `@hooks`, `@api`, or `@/lib/...`) instead of a relative path.',
  },
  {
    group: ['@/lib/interfaces/**'],
    message: 'Import via the `@interfaces` barrel.',
  },
  {
    group: ['@/lib/constants/**'],
    message: 'Import via the `@constants` barrel.',
  },
  {
    group: ['@/lib/hooks/**'],
    message: 'Import via the `@hooks` barrel.',
  },
  {
    group: ['@/api/**'],
    message: 'Import via the `@api` barrel.',
  },
];

const codeStyleRules = {
  files: SOURCE_FILES,
  rules: {
    'func-style': ['error', 'expression', { allowArrowFunctions: true }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'return' }],
  },
};

const reactRules = {
  files: SOURCE_FILES,
  rules: {
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: "CallExpression[callee.name='clsx'][arguments.length=1][arguments.0.type='Literal']",
        message: 'Do not wrap a single static string in clsx — use a plain string.',
      },
      {
        selector: "CallExpression[callee.name='clsx'][arguments.length=1][arguments.0.type='TemplateLiteral']",
        message: 'Do not wrap a single static template literal in clsx — use a plain string.',
      },
    ],
  },
};

const importStructureRules = {
  files: SOURCE_FILES,
  rules: {
    'import/no-duplicates': 'error',
    'import/no-namespace': 'error',
    'import/no-cycle': ['error', { maxDepth: 3, ignoreExternal: true }],
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': ['error', { noUselessIndex: true }],
    'import/newline-after-import': ['error', { count: 1 }],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          { pattern: '@interfaces', group: 'internal', position: 'before' },
          { pattern: '@interfaces/**', group: 'internal', position: 'before' },
          { pattern: '@constants', group: 'internal', position: 'before' },
          { pattern: '@constants/**', group: 'internal', position: 'before' },
          { pattern: '@hooks', group: 'internal', position: 'before' },
          { pattern: '@hooks/**', group: 'internal', position: 'before' },
          { pattern: '@api', group: 'internal', position: 'before' },
          { pattern: '@api/**', group: 'internal', position: 'before' },
          { pattern: '@story-interfaces', group: 'internal', position: 'before' },
          { pattern: '@story-interfaces/**', group: 'internal', position: 'before' },
          { pattern: '@/**', group: 'internal', position: 'after' },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        distinctGroup: false,
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
  },
};

const importRestrictionRules = {
  files: SOURCE_FILES,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        paths: restrictedImportPaths,
        patterns: restrictedImportPatterns,
      },
    ],
  },
};

const typescriptRules = {
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

const storybookOverride = {
  files: STORYBOOK_FILES,
  rules: {
    'react/function-component-definition': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
};

const declarationFilesOverride = {
  files: ['**/*.d.ts'],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
  },
};

const useTranslationsWrapperOverride = {
  files: ['src/lib/hooks/useTranslations.ts'],
  rules: { 'no-restricted-imports': 'off' },
};

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs['flat/recommended'],

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'storybook-static/**',
    'coverage/**',
    'next-env.d.ts',
    'node_modules/**',
    '.idea/**',
    '.husky/_/**',
    '.vercel/**',
    '.env*',
    'supabase/.branches/**',
    'supabase/.temp/**',
    'supabase/migrations/**',
    'src/lib/supabase/database.types.ts',
  ]),

  codeStyleRules,
  reactRules,
  importStructureRules,
  importRestrictionRules,
  typescriptRules,

  storybookOverride,
  declarationFilesOverride,
  useTranslationsWrapperOverride,
]);
