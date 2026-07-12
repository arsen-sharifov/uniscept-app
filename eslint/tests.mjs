import vitest from '@vitest/eslint-plugin';

import { TEST_FILES } from './consts.mjs';

export const testConventionRules = {
  files: TEST_FILES,
  plugins: { vitest },
  rules: {
    'vitest/consistent-test-it': ['error', { fn: 'test', withinDescribe: 'test' }],
    'vitest/expect-expect': 'error',
    'vitest/max-nested-describe': ['error', { max: 3 }],
    'vitest/no-commented-out-tests': 'error',
    'vitest/no-disabled-tests': 'error',
    'vitest/no-focused-tests': 'error',
    'vitest/no-identical-title': 'error',
    'vitest/no-standalone-expect': 'error',
    'vitest/prefer-hooks-on-top': 'error',
    'vitest/valid-describe-callback': 'error',
    'vitest/valid-expect': 'error',
  },
};
