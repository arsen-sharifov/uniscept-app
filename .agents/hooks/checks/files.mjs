import { LEFT_TO_PERSON, READ_ONLY_AGENT, SECRET_FILES, SETUP_APPROVAL } from '../consts/messages.mjs';
import { READ_ONLY_AGENTS } from '../rules.mjs';
import { isProtected, isReadOnlyOutput, isSecret } from '../utils/paths.mjs';
import { ask, deny } from '../utils/results.mjs';

export const checkFiles = ({ paths, isWrite, agentType }) => {
  const isOutputOnly = paths.length > 0 && paths.every(isReadOnlyOutput);

  if (paths.some(isSecret)) return deny(`${SECRET_FILES} ${LEFT_TO_PERSON}`);
  if (isWrite && READ_ONLY_AGENTS.includes(agentType) && !isOutputOnly) return deny(READ_ONLY_AGENT);
  if (isWrite && paths.some(isProtected)) return ask(SETUP_APPROVAL, { kind: 'setup' });

  return null;
};
