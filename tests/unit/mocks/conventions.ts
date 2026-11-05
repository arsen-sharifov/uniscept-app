export const VALID_PULL_REQUEST = {
  branch: 'dev-12',
  title: 'chore(dev-12): Define the assistant workflow',
  body: 'Share the development workflow.\n\nCloses #12',
  subjects: ['chore(dev-12): Define the assistant workflow'],
  version: '0.10.0',
  baseVersion: '0.9.0',
};

export const ACCEPTED_PULL_REQUESTS = [
  { name: 'the description closes the issue once', change: {} },
  {
    name: 'the description closes the same issue twice',
    change: { body: 'Share the development workflow.\n\nCloses #12\n\nThis closes #12 for good.' },
  },
  {
    name: 'a commit on the branch reverts an earlier one',
    change: {
      subjects: [
        'chore(dev-12): Define the assistant workflow',
        'Revert "chore(dev-12): Define the assistant workflow"',
      ],
    },
  },
];

export const TEXT_WITHOUT_HIDDEN_CHARACTERS = 'Plain rules with the apostrophe ʼ and an emoji 🤖';

export const TEXT_WITH_HIDDEN_CHARACTERS = `First line\nSecond ${String.fromCodePoint(0x202e)}line${String.fromCodePoint(0xe0041)}${String.fromCodePoint(0x3164)}`;

export const HIDDEN_CHARACTER_FINDINGS = [
  { line: 2, column: 8, codePoint: 'U+202E' },
  { line: 2, column: 13, codePoint: 'U+E0041' },
  { line: 2, column: 14, codePoint: 'U+3164' },
];

const CLOSE_ONLY_ERROR = 'The description must close only #12';

const MALFORMED_VERSIONS = ['1', '0.10', '1.foo.bar', '01.10.0', '1.0.0.0', '1.0.0-beta', '1.0.0+build.2'];

export const INVALID_PULL_REQUESTS = [
  ...MALFORMED_VERSIONS.map((version) => ({
    name: `the version ${version} is not a plain release version`,
    change: { version },
    error: `The version must be above 0.9.0, found ${version}`,
  })),
  {
    name: 'the branch has no issue number',
    change: { branch: 'main' },
    error: 'The branch must be named dev-<issue number>',
  },
  {
    name: 'the title has the wrong scope',
    change: { title: 'chore(dev-13): Mention (dev-12): setup' },
    error: 'The title scope must be dev-12 to match the branch',
  },
  {
    name: 'a commit has the wrong scope',
    change: { subjects: ['chore(dev-13): Mention (dev-12): setup'] },
    error: 'Every commit scope must be dev-12',
  },
  { name: 'the closing issue has a longer number', change: { body: 'Closes #120' }, error: CLOSE_ONLY_ERROR },
  { name: 'the closing issue is only in a comment', change: { body: '<!-- Closes #12 -->' }, error: CLOSE_ONLY_ERROR },
  {
    name: 'the closing issue is only in a code block',
    change: { body: '```\nCloses #12\n```' },
    error: CLOSE_ONLY_ERROR,
  },
  { name: 'the body closes more than one issue', change: { body: 'Closes #12\nCloses #13' }, error: CLOSE_ONLY_ERROR },
  {
    name: 'the prose also fixes another issue',
    change: { body: 'Closes #12\n\nThis also fixes #13.' },
    error: CLOSE_ONLY_ERROR,
  },
  {
    name: 'the version is not bumped',
    change: { version: '0.9.0' },
    error: 'The version must be above 0.9.0, found 0.9.0',
  },
  {
    name: 'the version is below main',
    change: { baseVersion: '0.11.0' },
    error: 'The version must be above 0.11.0, found 0.10.0',
  },
];
