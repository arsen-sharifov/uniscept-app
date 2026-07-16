import { SOURCE_FILES } from './consts.mjs';

export const codeStyleRules = {
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

export const reactRules = {
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
