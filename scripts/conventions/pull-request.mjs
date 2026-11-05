import { execFileSync } from 'node:child_process';

import { getPullRequestErrors } from './utils/metadata.mjs';

const { BASE_REF, HEAD_SHA, HEAD_REF = '', PR_TITLE = '', PR_BODY = '' } = process.env;
const baseRevision = `origin/${BASE_REF}`;

const runGit = (...parameters) => execFileSync('git', parameters, { encoding: 'utf8' });
const readVersion = (revision) => JSON.parse(runGit('show', `${revision}:package.json`)).version;

const errors = getPullRequestErrors({
  branch: HEAD_REF,
  title: PR_TITLE,
  body: PR_BODY,
  subjects: runGit('log', '--no-merges', '--format=%s', `${baseRevision}..${HEAD_SHA}`).split('\n').filter(Boolean),
  version: readVersion(HEAD_SHA),
  baseVersion: readVersion(baseRevision),
});

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
}
