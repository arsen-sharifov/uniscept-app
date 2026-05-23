const DEV_SCOPE = /^dev-\d+$/;

const config = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\((\S+?)\))?(!?): (.+)$/,
      headerCorrespondence: ['type', 'scope', 'breaking', 'subject'],
    },
  },
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'chore', 'docs', 'refactor', 'test']],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-dev-format': [2, 'always'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  plugins: [
    {
      rules: {
        'scope-dev-format': ({ scope }) => {
          if (!scope) return [true];

          return [DEV_SCOPE.test(scope), `Scope must match "dev-{number}" (e.g., dev-1, dev-42). Got: "${scope}"`];
        },
      },
    },
  ],
};

export default config;
