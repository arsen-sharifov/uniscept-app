import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { findHiddenCharacters } from './utils/characters.mjs';

const isText = (content) => !content.includes('\0');

const findings = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .flatMap((file) => {
    const content = readFileSync(file, 'utf8');

    if (!isText(content)) return [];

    return findHiddenCharacters(content).map(({ line, column, codePoint }) => `${file}:${line}:${column} ${codePoint}`);
  });

if (findings.length > 0) {
  console.error(`Hidden characters in tracked files:\n${findings.join('\n')}`);
  process.exitCode = 1;
}
