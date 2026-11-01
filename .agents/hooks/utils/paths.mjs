import { posix, win32 } from 'node:path';

import { PROJECT_DIRECTORY } from '../consts/hooks.mjs';
import { HOME_PATH } from '../consts/tools.mjs';
import {
  PERSONAL_MEMORY,
  PROTECTED_FILES,
  PROTECTED_FOLDERS,
  READ_ONLY_OUTPUT,
  SECRET_FILE,
  SECRET_PATHS,
  WORKTREE_ROOT,
} from '../rules.mjs';

const toPaddedPath = (path) => `/${path.replaceAll('\\', '/')}/`.toLowerCase();

const PROJECT_ROOT = toPaddedPath(PROJECT_DIRECTORY);

const toProjectPath = (padded) => {
  if (WORKTREE_ROOT.test(padded)) return padded.replace(WORKTREE_ROOT, '');
  if (padded.startsWith(PROJECT_ROOT)) return padded.slice(PROJECT_ROOT.length - 1);

  return null;
};

export const resolvePath = (path, directory) => {
  const normalized = path.replaceAll('\\', '/');
  const isAbsolute = HOME_PATH.test(normalized) || posix.isAbsolute(normalized) || win32.isAbsolute(normalized);

  return posix.normalize(isAbsolute ? normalized : `${directory.replaceAll('\\', '/')}/${normalized}`);
};

export const isSecret = (word) => {
  const path = toPaddedPath(word);

  return SECRET_FILE.test(path) || SECRET_PATHS.some((fragment) => path.includes(fragment));
};

export const isReadOnlyOutput = (resolvedPath) =>
  toProjectPath(toPaddedPath(resolvedPath))?.startsWith(`/${READ_ONLY_OUTPUT}/`) ?? false;

export const isProtected = (resolvedPath) => {
  const padded = toPaddedPath(resolvedPath);
  const projectPath = toProjectPath(padded);
  const isInFolder = (folder) => (projectPath ? projectPath.startsWith(`/${folder}/`) : padded.includes(`/${folder}/`));

  return (
    !PERSONAL_MEMORY.test(padded) &&
    (PROTECTED_FILES.some((file) => padded.endsWith(`/${file}/`)) || PROTECTED_FOLDERS.some(isInFolder))
  );
};
