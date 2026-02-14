export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'test'],
    ],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-dev-format': [2, 'always'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
  plugins: [
    {
      rules: {
        'scope-dev-format': ({ scope }) => {
          if (!scope) return [true];
          const pattern = /^dev-\d+$/;
          const isValid = pattern.test(scope);
          return [
            isValid,
            `Scope must match format "dev-{number}" (e.g., dev-1, dev-42). Got: "${scope}"`,
          ];
        },
      },
    },
  ],
};
