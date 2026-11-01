import { COMMAND_APPROVAL, LEFT_TO_PERSON, SECRET_FILES, SETUP_APPROVAL } from '../consts/messages.mjs';
import {
  COPY_DESTINATION_OPTIONS,
  FILE_WRITE_COMMANDS,
  FILE_SELECTION_OPTIONS,
  PATTERN_OPTIONS,
  PATTERN_SEARCHES,
} from '../consts/shell.mjs';
import { APPROVAL_COMMANDS, FORBIDDEN_COMMANDS, FORBIDDEN_WORDS } from '../rules.mjs';
import { isProtected, isSecret, resolvePath } from '../utils/paths.mjs';
import { ask, deny } from '../utils/results.mjs';
import { startsWithPhrase, toCommands, toSegmentCommands } from '../utils/shell.mjs';

const matchesArgument = (argument, pattern) =>
  pattern instanceof RegExp ? pattern.test(argument) : argument === pattern || argument.startsWith(`${pattern}=`);

const matchesRule = ({ words }, { command, unless = [], withAny, hasNoArguments, hasOnlyOptions }) =>
  [command].flat().some((phrase) => {
    if (!startsWithPhrase(words, phrase)) return false;

    const rest = words.slice(phrase.split(' ').length);

    return (
      !unless.some((exception) => startsWithPhrase(rest, exception)) &&
      (!withAny || rest.some((argument) => withAny.some((pattern) => matchesArgument(argument, pattern)))) &&
      (!hasNoArguments || rest.length === 0) &&
      (!hasOnlyOptions || rest.every((argument) => argument.startsWith('-')))
    );
  });

const readSearchPattern = (words) => {
  const phrase = PATTERN_SEARCHES.find((candidate) => startsWithPhrase(words, candidate));
  const parameters = phrase ? words.slice(phrase.split(' ').length) : [];
  const isPatternUnclear = parameters.some((parameter) =>
    [...PATTERN_OPTIONS, ...FILE_SELECTION_OPTIONS].includes(parameter),
  );

  return isPatternUnclear
    ? parameters.find((_parameter, index) => PATTERN_OPTIONS.includes(parameters[index - 1]))
    : parameters.find((parameter) => !parameter.startsWith('-'));
};

const findForbidden = (command) => {
  const patternIndex = command.scannedWords.indexOf(readSearchPattern(command.words));

  if (command.scannedWords.some((word, index) => index !== patternIndex && isSecret(word))) {
    return { reason: SECRET_FILES };
  }

  return (
    FORBIDDEN_WORDS.find(
      ({ pattern, unless = [] }) =>
        !unless.some((phrase) => startsWithPhrase(command.words, phrase)) &&
        command.scannedWords.some((word) => pattern.test(word)),
    ) ?? FORBIDDEN_COMMANDS.find((candidate) => matchesRule(command, candidate))
  );
};

const needsApproval = (command) => command.isPackageRun || APPROVAL_COMMANDS.some((rule) => matchesRule(command, rule));

const findWrittenPaths = ([, ...parameters], { isCopy = false }) => {
  if (!isCopy) return parameters;

  const target =
    parameters.find((_parameter, index) => COPY_DESTINATION_OPTIONS.includes(parameters[index - 1])) ??
    parameters.filter((parameter) => !parameter.startsWith('-')).at(-1);

  return target ? [target] : [];
};

const changesSetup = ({ words, redirects }, directory) => {
  const rule = FILE_WRITE_COMMANDS.find((candidate) => matchesRule({ words }, candidate));
  const writtenPaths = rule ? findWrittenPaths(words, rule) : [];

  return [...writtenPaths, ...redirects].some((path) => isProtected(resolvePath(path, directory)));
};

export const checkCommands = ({ command, isPatch, directory }) => {
  if (isPatch) return null;

  const script = [command].flat().join(' ');
  const commands = Array.isArray(command) ? toSegmentCommands(command) : toCommands(script);
  const forbidden = commands.map(findForbidden).find(Boolean);

  if (forbidden) return deny(`${forbidden.reason} ${forbidden.instead ?? LEFT_TO_PERSON}`);

  const approvals = commands.filter(needsApproval);
  const pending = [...new Set([...approvals, ...commands.filter((candidate) => changesSetup(candidate, directory))])];

  if (pending.length === 0) return null;
  if (approvals.length === 0) return ask(SETUP_APPROVAL, { kind: 'setup', script, commands: pending });

  return ask(`"${approvals[0].words.join(' ')}" ${COMMAND_APPROVAL}`, { kind: 'command', script, commands: pending });
};
