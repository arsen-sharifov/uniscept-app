import {
  ASSIGNMENT,
  COMMAND_BOUNDARY,
  EVAL_COMMANDS,
  EXECUTABLE_SUFFIX,
  EXPANSION,
  EXPANSION_MARKS,
  FIND_ACTIONS,
  HEREDOC,
  HEREDOC_QUOTES,
  LEADING_NUMBER,
  LEADING_OPTIONS,
  LINE_CONTINUATION,
  LOCAL_RUNNERS,
  MESSAGE_FLAGS,
  PACKAGE_RUNNERS,
  PASSTHROUGH_PROGRAMS,
  PATH_PREFIX,
  POSITIONAL_SCRIPT_SHELLS,
  POWERSHELL_FILE_FLAGS,
  POWERSHELL_OPTIONS,
  QUOTED,
  QUOTED_TEXT_OR_COMMENT,
  REDIRECT_OPERATOR,
  SCRIPT_ALIASES,
  SCRIPT_FLAGS,
  SCRIPT_RUNNERS,
  SEPARATOR,
  SHELL_KEYWORDS,
  SHELLS,
  SHORT_FLAG_BUNDLE,
  SUBSTITUTED,
  SUBSTITUTION,
  TEXT_INPUT_PROGRAMS,
  TOKEN,
  VERSION_SUFFIX,
  WHITESPACE,
  WRAPPER_COMMANDS,
} from '../consts/shell.mjs';

const toProgram = (word = '') =>
  word.replace(PATH_PREFIX, '').replace(EXECUTABLE_SUFFIX, '').replace(VERSION_SUFFIX, '').toLowerCase();

const readEntry = (table, key) => (Object.hasOwn(table, key) ? table[key] : undefined);

export const startsWithPhrase = (words, phrase) =>
  phrase.split(' ').every((word, index) => (index === 0 ? toProgram(words[0]) === word : words[index] === word));

const unquote = (token) => token.replace(QUOTED, (_match, double, single) => double ?? single);

const isRedirectOperator = (token = '') => REDIRECT_OPERATOR.test(token);

const toSegment = (tokens) => ({
  words: tokens
    .filter((token, index) => !isRedirectOperator(token) && !isRedirectOperator(tokens[index - 1]))
    .map(unquote),
  redirects: tokens
    .filter((token, index) => !isRedirectOperator(token) && isRedirectOperator(tokens[index - 1]))
    .map(unquote),
});

const splitSegments = (script) => {
  const tokens = script.match(TOKEN) ?? [];
  const separators = tokens.flatMap((token, index) => (SEPARATOR.test(token) ? [index] : []));

  return [-1, ...separators]
    .map((start, index) => toSegment(tokens.slice(start + 1, separators[index] ?? tokens.length)))
    .filter(({ words, redirects }) => words.length > 0 || redirects.length > 0);
};

const readLastProgram = (line) =>
  toProgram(line.replace(QUOTED, '').split(COMMAND_BOUNDARY).at(-1).trim().split(WHITESPACE)[0]);

const keepHeredocCode = (_heredoc, header, quote, delimiter, rest, body) => {
  const command = `${header}<<${delimiter}${rest}`;
  const isText = Boolean(quote) && !rest.includes('|') && TEXT_INPUT_PROGRAMS.includes(readLastProgram(header));

  return isText ? command : `${command}\n${body.replace(HEREDOC_QUOTES, ' ')}`;
};

const dropComment = (text) => (text.startsWith('#') ? '' : text);

const hideQuotedExpansions = (text) => (text.startsWith("'") ? text.replace(EXPANSION_MARKS, ' ') : text);

const extractSubstitutions = (script) => {
  const matches = [...script.replace(QUOTED_TEXT_OR_COMMENT, hideQuotedExpansions).matchAll(SUBSTITUTION)];

  if (matches.length === 0) return { script, substitutions: [] };

  const substitutions = matches.map(({ indices }) => script.slice(...(indices[1] ?? indices[2])));
  const replaced = matches.reduceRight(
    (text, { index, 0: match }) => `${text.slice(0, index)}${SUBSTITUTED}${text.slice(index + match.length)}`,
    script,
  );
  const inner = extractSubstitutions(replaced);

  return { script: inner.script, substitutions: [...substitutions, ...inner.substitutions] };
};

const dropFlags = (words) => {
  const index = words.findIndex((word) => !word.startsWith('-'));

  return index === -1 ? [] : words.slice(index);
};

const dropOptions = (parameters, options) => {
  const { withValue, isLimitedToValues = false } = options;
  const [option = '', ...rest] = parameters;
  const isOption =
    withValue.some((name) => option.startsWith(`${name}=`)) || (!isLimitedToValues && option.startsWith('-'));

  if (withValue.includes(option)) return dropOptions(rest.slice(1), options);

  return isOption ? dropOptions(rest, options) : parameters;
};

const toWrappedCommands = (parameters) => {
  const words = dropFlags(parameters);
  const hasOptions = words.length < parameters.length || LEADING_NUMBER.test(words[0]);

  return hasOptions && words.length > 1 ? [words, ...toWrappedCommands(words.slice(1))] : [words];
};

const unwrap = (words, isPackageRun = false) => {
  const [first = '', ...rest] = words;
  const program = toProgram(first);
  const options = readEntry(LEADING_OPTIONS, program);
  const parameters = options ? dropOptions(rest, options) : rest;
  const command = [program, ...parameters];
  const alias = Object.keys(SCRIPT_ALIASES).find((phrase) => startsWithPhrase(command, phrase));
  const runner = [...PACKAGE_RUNNERS, ...LOCAL_RUNNERS].find((phrase) => startsWithPhrase(command, phrase));
  const runnerWords = runner ? dropFlags(command.slice(runner.split(' ').length)) : [];
  const actionIndex = program === 'find' ? words.findIndex((word) => FIND_ACTIONS.includes(word)) : -1;

  if (ASSIGNMENT.test(first) || (rest.length > 0 && SHELL_KEYWORDS.includes(program))) {
    return unwrap(rest, isPackageRun);
  }
  if (dropFlags(rest).length > 0 && WRAPPER_COMMANDS.includes(program)) {
    return toWrappedCommands(rest).flatMap((wrappedWords) => unwrap(wrappedWords, isPackageRun));
  }
  if (alias) {
    return unwrap([...SCRIPT_ALIASES[alias].split(' '), ...command.slice(alias.split(' ').length)], isPackageRun);
  }
  if (runnerWords.length > 0) {
    return unwrap(runnerWords, isPackageRun || (PACKAGE_RUNNERS.includes(runner) && !words.includes('--no-install')));
  }
  if (SCRIPT_RUNNERS.includes(program) && PASSTHROUGH_PROGRAMS.includes(toProgram(parameters[0]))) {
    return unwrap(parameters, isPackageRun);
  }
  if (actionIndex !== -1) {
    return [
      ...unwrap(words.slice(0, actionIndex), isPackageRun),
      ...unwrap(words.slice(actionIndex + 1), isPackageRun),
    ];
  }

  return [{ words: command, isPackageRun }];
};

const findScriptStart = (parameters, flag) => {
  const start = parameters.findIndex((parameter) => flag.test(parameter)) + 1;

  return start === 0 || parameters.slice(start).join(' ') === '-' ? null : start;
};

const findPositionalScriptStart = (parameters) => {
  const lowered = parameters.map((parameter) => parameter.toLowerCase());
  const start = lowered.length - dropOptions(lowered, POWERSHELL_OPTIONS).length;
  const isFile = lowered.some((parameter) => POWERSHELL_FILE_FLAGS.includes(parameter));

  return isFile ? null : start;
};

const findScriptWords = ([program, ...parameters]) => {
  if (EVAL_COMMANDS.includes(program)) return parameters;

  const shell = readEntry(SHELLS, program);

  if (!shell) return [];

  const flagStart = findScriptStart(parameters, SCRIPT_FLAGS[shell]);
  const isPositional = flagStart === null && POSITIONAL_SCRIPT_SHELLS.includes(program);
  const start = isPositional ? findPositionalScriptStart(parameters) : flagStart;

  return start === null ? [] : parameters.slice(start);
};

const findMessageFlags = (commands) =>
  commands.flatMap(({ words }) =>
    Object.entries(MESSAGE_FLAGS).flatMap(([phrase, flags]) => (startsWithPhrase(words, phrase) ? flags : [])),
  );

const isMessageFlag = (token = '', flags) =>
  flags.some((flag) =>
    flag.startsWith('--') ? token === flag : token.endsWith(flag[1]) && SHORT_FLAG_BUNDLE.test(token.slice(0, -1)),
  );

const carriesMessage = (token, flags) =>
  flags.some((flag) => {
    if (flag.startsWith('--')) return token.startsWith(`${flag}=`);

    const index = token.indexOf(flag[1]);

    return index > 0 && index < token.length - 1 && SHORT_FLAG_BUNDLE.test(token.slice(0, index));
  });

const isMessageText = (tokens, index, flags) =>
  !EXPANSION.test(tokens[index]) && (isMessageFlag(tokens[index - 1], flags) || carriesMessage(tokens[index], flags));

export const toSegmentCommands = (tokens, isHidden = false, redirects = []) => {
  const commands = unwrap(tokens);
  const scripts = commands.map(({ words }) => findScriptWords(words));
  const scriptLength = Math.max(0, ...scripts.map((script) => script.length));
  const messageFlags = findMessageFlags(commands);
  const scannedWords = [
    ...tokens
      .slice(0, tokens.length - scriptLength)
      .filter((_token, index) => !isMessageText(tokens, index, messageFlags)),
    ...redirects,
  ];

  return commands.flatMap((command, index) => {
    const segmentCommand = { ...command, tokens, scannedWords, redirects, isHidden };

    return scripts[index].length === 0
      ? [segmentCommand]
      : [segmentCommand, ...toCommands(scripts[index].join(' '), true)];
  });
};

export const toCommands = (script, isHidden = false) => {
  const literalScript = script
    .replace(HEREDOC, keepHeredocCode)
    .replace(QUOTED_TEXT_OR_COMMENT, dropComment)
    .replace(LINE_CONTINUATION, ' ');
  const { script: plainScript, substitutions } = extractSubstitutions(literalScript);

  return [
    ...splitSegments(plainScript).flatMap(({ words, redirects }) => toSegmentCommands(words, isHidden, redirects)),
    ...substitutions.flatMap((substitution) => toCommands(substitution, true)),
  ];
};
