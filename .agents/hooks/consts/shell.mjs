export const TOKEN = /&&|\|\||[;|&()\n\r]|\d?>>?\|?|(?:"(?:[^"\\]|\\[\s\S])*"|'[^']*'|\\[\s\S]|[^\s;|&()"'>\\])+/g;
export const QUOTED = /"((?:[^"\\]|\\.)*)"|'([^']*)'/g;
export const QUOTED_TEXT_OR_COMMENT =
  /"(?:[^"\\$]|\\[\s\S]|\$\((?:[^()'"\\]|\\[\s\S]|'[^']*'|"(?:[^"\\]|\\[\s\S])*")*\)|\$)*"|'[^']*'|\\[\s\S]|(?<![^\s;|&()])#.*/g;
export const SEPARATOR = /^(?:[;|&()\n\r]|[{}]$)/;
export const REDIRECT_OPERATOR = /^\d?>>?\|?$/;
export const LINE_CONTINUATION = /\\\r?\n/g;
export const HEREDOC = /^([^\n]*?)(?<!<)<<-?[ \t]*(['"]?)(\w+)\2([^\n]*)\n([\s\S]*?)^\t*\3(?=\)|\r?$)/gm;
export const HEREDOC_QUOTES = /['"]/g;
export const COMMAND_BOUNDARY = /[;|&(]/;
export const WHITESPACE = /\s+/;
export const SUBSTITUTION = /\$\(((?:[^()'"\\]|\\[\s\S]|'[^']*'|"(?:[^"\\]|\\[\s\S])*")*)\)|`([^`\n]*)`/dg;
export const SUBSTITUTED = '$';
export const ASSIGNMENT = /^[A-Za-z_]\w*=/;
export const EXPANSION = /\$/;
export const EXPANSION_MARKS = /[$`]/g;
export const SHORT_FLAG_BUNDLE = /^-[a-zA-Z]*$/;
export const LEADING_NUMBER = /^\d/;
export const PATH_PREFIX = /^.*[/\\]/;
export const EXECUTABLE_SUFFIX = /\.(?:exe|cmd|bat)$/i;
export const VERSION_SUFFIX = /(?<=.)@.*$/;

export const SHELLS = {
  bash: 'posix',
  sh: 'posix',
  zsh: 'posix',
  pwsh: 'windows',
  powershell: 'windows',
  cmd: 'windows',
};
export const SCRIPT_FLAGS = {
  posix: /^-[a-zA-Z]*c[a-zA-Z]*$/,
  windows: /^(?:-co?m?m?a?n?d?|-commandwithargs|-cwa|\/[ck])$/i,
};
export const POSITIONAL_SCRIPT_SHELLS = ['powershell'];
export const POWERSHELL_OPTIONS = {
  withValue: [
    '-executionpolicy',
    '-ep',
    '-windowstyle',
    '-outputformat',
    '-inputformat',
    '-configurationname',
    '-version',
    '-psconsolefile',
    '-workingdirectory',
    '-wd',
  ],
};
export const POWERSHELL_FILE_FLAGS = ['-file', '-f'];
export const EVAL_COMMANDS = ['eval', 'invoke-expression', 'iex'];
export const SHELL_KEYWORDS = ['if', 'then', 'else', 'elif', 'while', 'until', 'do', '!', 'coproc'];

export const WRAPPER_COMMANDS = [
  'env',
  'sudo',
  'command',
  'exec',
  'time',
  'timeout',
  'nice',
  'nohup',
  'xargs',
  'wsl',
  'call',
  'start',
  'corepack',
];
export const FILE_WRITE_COMMANDS = [
  {
    command: [
      'tee',
      'touch',
      'mv',
      'rm',
      'truncate',
      'chmod',
      'git mv',
      'move',
      'ren',
      'set-content',
      'add-content',
      'clear-content',
      'out-file',
      'new-item',
      'move-item',
      'rename-item',
      'sc',
      'ac',
      'ni',
      'mi',
      'rni',
    ],
  },
  { command: ['cp', 'ln', 'install', 'copy', 'copy-item', 'cpi'], isCopy: true },
  { command: ['sed', 'perl'], withAny: [/^-[a-zA-Z]*i/, '--in-place'] },
];
export const COPY_DESTINATION_OPTIONS = ['-t', '--target-directory', '-Destination', '-destination'];

export const TEXT_INPUT_PROGRAMS = ['cat', 'tee', 'git', 'gh'];
export const FIND_ACTIONS = ['-exec', '-execdir', '-ok', '-okdir'];
export const LOCAL_RUNNERS = ['pnpm exec', 'yarn exec'];
export const PACKAGE_RUNNERS = [
  'npx',
  'pnpx',
  'bunx',
  'pnpm dlx',
  'yarn dlx',
  'npm exec',
  'npm x',
  'npm init',
  'npm create',
  'pnpm create',
  'yarn create',
];
export const SCRIPT_ALIASES = { 'node --run': 'npm run' };
export const SCRIPT_RUNNERS = ['pnpm', 'yarn'];
export const PASSTHROUGH_PROGRAMS = ['supabase', 'vercel'];

export const SEARCH_COMMANDS = ['rg', 'grep', 'git grep', 'findstr', 'select-string', 'sls'];
export const PATTERN_SEARCHES = ['rg', 'grep', 'git grep'];
export const PATTERN_OPTIONS = ['-e', '--regexp'];
export const FILE_SELECTION_OPTIONS = ['-f', '--file', '-g', '--glob', '--iglob', '--pre-glob'];

export const LEADING_OPTIONS = {
  git: { withValue: ['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--super-prefix', '--config-env'] },
  pnpm: { withValue: ['-C', '--dir', '-F', '--filter', '--reporter', '--loglevel'] },
  npm: { withValue: ['-C', '--prefix', '-w', '--workspace', '--loglevel', '--userconfig', '--cache', '--registry'] },
  yarn: { withValue: ['--cwd'] },
  gh: { withValue: ['-R', '--repo', '--hostname'], isLimitedToValues: true },
};
export const MESSAGE_FLAGS = {
  'git commit': ['-m', '--message'],
  'git tag': ['-m', '--message'],
  'git notes': ['-m', '--message'],
  'gh pr': ['-t', '--title', '-b', '--body'],
  'gh issue': ['-t', '--title', '-b', '--body'],
  'gh release': ['-t', '--title', '-n', '--notes'],
};
