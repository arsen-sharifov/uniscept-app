import { SEARCH_COMMANDS, SHELLS } from './consts/shell.mjs';

const SECRET_WORDS = 'TOKEN|SECRET|PASSWORD|PASSPHRASE|API_KEY|ACCESS_KEY|PRIVATE_KEY|SERVICE_ROLE_KEY';
const SECRET_NAME = `\\w*(?:${SECRET_WORDS})\\b`;

const ENVIRONMENT_SECRETS = 'Reading secrets from the environment';
const ENVIRONMENT_VARIABLES = 'Reading environment variables that can hold tokens';
const SKIPPED_HOOKS = 'Skipping the git hooks';
const GITHUB_TOKEN_HANDLING = 'Handling the GitHub token';
const RELEASE_WORKFLOW = 'Starting the owner-only Release workflow';
const PIPED_COMMANDS = 'Running piped commands that cannot be checked';
const HOSTED_SUPABASE = 'A Supabase command that can reach the hosted project';
const REMOTE_DATABASE = 'A Supabase command aimed at a remote database';
const FORCE_PUSH = 'A force push, a push of every branch or a remote branch deletion';
const ENCODED_COMMAND = 'Running an encoded command that cannot be checked';
const SECRETS_AND_VARIABLES = 'Reading or changing repository secrets and variables';
const PRODUCTION_ENVIRONMENT = 'Reaching the production GitHub environment';
const IGNORED_FILES_SEARCH = 'Searching ignored files such as .env.local';
const RECURSIVE_GREP = 'A recursive grep also reads ignored files such as .env.local.';
const SEARCH_WITH_RG = 'Search with rg or the Grep tool instead, which skip them.';

export const PROMPT_SECRETS = [
  { name: 'a GitHub token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_\w{22,})/ },
  { name: 'a Notion token', pattern: /\b(?:ntn_[A-Za-z0-9]{40,}|secret_[A-Za-z0-9]{43}\b)/ },
  { name: 'a Supabase access token', pattern: /\bsbp_(?:oauth_|v0_)?[a-f0-9]{40}\b/ },
  { name: 'a Supabase secret key', pattern: /\bsb_secret_[\w-]{20,}/ },
  { name: 'a Supabase service role key', pattern: /(?<![\w-])eyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g, role: 'service_role' },
  { name: 'a SonarQube token', pattern: /\bsq[apu]_[a-f0-9]{40}\b/ },
  { name: 'an npm token', pattern: /\bnpm_[A-Za-z0-9]{36}\b/ },
  { name: 'a Resend API key', pattern: /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/ },
  { name: 'an AI provider API key', pattern: /\bsk-(?:ant|proj)-[\w-]{32,}/ },
  { name: 'a Stripe live key', pattern: /\b[rs]k_live_[A-Za-z0-9]{20,}/ },
  { name: 'an AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'a private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    name: 'a database password',
    pattern:
      /\bpostgres(?:ql)?:\/\/[^:\s/@]+:[^@\s]+@(?!(?:localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0|host\.docker\.internal)(?![\w.-]))/,
  },
  {
    name: 'a secret from an environment file',
    pattern: new RegExp(
      `^[ \\t]*(?:export\\s+)?(?:[A-Z][A-Z0-9_]*)?(?:${SECRET_WORDS})\\w*=['"]?(?![$<{%])[^\\s'"]{16,}`,
      'm',
    ),
  },
];
export const LOCAL_SUPABASE_KEY_HASHES = ['c85debb55f2f204d868cc1552c42faa143b4c675f61363ab040dd50b5b5304cd'];
export const LOCAL_SUPABASE_ISSUER = 'supabase-demo';

export const BROWSER_MCP_SERVERS = [
  'browser',
  'playwright',
  'verifier-browser',
  'puppeteer',
  'chrome-devtools',
  'chrome_devtools',
  'claude-in-chrome',
  'cua_repl',
  'node_repl',
];
export const LOCAL_MCP_SERVERS = ['filesystem', 'ide', ...BROWSER_MCP_SERVERS];
export const PROJECT_SERVICES = [
  'notion/',
  'github/',
  'claude_ai_Github/',
  'claude_ai_Notion/',
  'codex_apps/github',
  'codex_apps/notion',
];

export const SECRET_FILE = /[^\w.!]\.env(?![\w-])(?!\.example(?![\w.-]))/;
export const SECRET_PATHS = [
  '/.supabase/',
  '/supabase/.temp/',
  'com.vercel.cli',
  '/.claude.json',
  '/.credentials.json',
  '/.codex/auth.json',
  '/.git-credentials',
  '/.ssh/',
  '/gh/hosts.yml',
  '/github cli/hosts.yml',
  '/.docker/config.json',
  '/environ/',
  '~/.npmrc',
  '$home/.npmrc',
  '%userprofile%/.npmrc',
];
export const PROTECTED_FILES = [
  'agents.md',
  'agents.override.md',
  'claude.md',
  'claude.local.md',
  '.mcp.json',
  'commitlint.config.mjs',
  'codeowners',
];
export const PROTECTED_FOLDERS = [
  '.agents',
  '.claude',
  '.codex',
  '.git',
  '.husky',
  '.github/workflows',
  '.github/actions',
  'scripts/conventions',
];
export const PERSONAL_MEMORY = /\/\.claude\/projects\/[^/]+\/memory\//;
export const WORKTREE_ROOT = /^.*\/\.claude\/worktrees\/[^/]+(?=\/)/;
export const READ_ONLY_AGENTS = ['verifier'];
export const READ_ONLY_OUTPUT = 'artifacts/verify';
export const ACCOUNT_TOOLS = ['Artifact'];

const VERCEL_PUBLIC_PATHS = ['/docs', '/guides', '/templates', '/blog', '/changelog'];

export const BLOCKED_SITES = [
  { host: 'uniscept.net', reason: 'The production app' },
  { host: 'supabase.co', reason: 'The hosted Supabase project' },
  { host: 'app.supabase.com', reason: 'The Supabase dashboard' },
  { host: 'supabase.com', paths: ['/dashboard'], reason: 'The Supabase dashboard' },
  { host: 'vercel.com', allowedPaths: VERCEL_PUBLIC_PATHS, reason: 'The Vercel dashboard' },
  { host: 'resend.com', allowedPaths: ['/docs'], reason: 'The Resend dashboard' },
  { host: 'github.com', reason: 'GitHub in a browser' },
  { host: 'github.dev', reason: 'GitHub in a browser' },
  { host: 'notion.so', reason: 'Notion in a browser' },
  { host: 'notion.site', reason: 'Notion in a browser' },
  { host: 'notion.com', reason: 'Notion in a browser' },
];

export const FORBIDDEN_WORDS = [
  { pattern: new RegExp(`(?:\\$\\{?|\\$?env:)${SECRET_NAME}`, 'i'), reason: ENVIRONMENT_SECRETS },
  { pattern: new RegExp(`process\\.env\\.${SECRET_NAME}`, 'i'), unless: SEARCH_COMMANDS, reason: ENVIRONMENT_SECRETS },
  { pattern: /\.supabase\.co\b|pooler\.supabase\.com\b/i, reason: 'Reaching the hosted Supabase project' },
  { pattern: /^(?:\$env:)?HUSKY=0$|^core\.hookspath=/i, reason: SKIPPED_HOOKS },
  { pattern: /^env:/i, unless: SEARCH_COMMANDS, reason: ENVIRONMENT_VARIABLES },
];

const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn'];
const LOCAL_SUPABASE_COMMANDS = [
  'start',
  'stop',
  'status',
  'init',
  'help',
  'test',
  'gen',
  'db reset',
  'db diff',
  'db lint',
  'db start',
  'migration new',
  'migration up',
  'migration list --local',
  '--help',
  '-h',
  '--version',
  '-v',
];
const CREDENTIAL_HELPERS = [
  'git credential',
  'git credential-manager',
  'git credential-manager-core',
  'git credential-store',
  'git credential-cache',
  'git-credential-manager',
  'git-credential-store',
];
const CREDENTIAL_STORES = [
  'cmdkey',
  'vaultcmd',
  'security find-generic-password',
  'security find-internet-password',
  'secret-tool',
];
const FORCE_PUSH_OPTIONS = [
  '--force',
  '--force-with-lease',
  '--mirror',
  '--delete',
  '--prune',
  '--all',
  /^-[a-z]*[fd][a-z]*$/,
  /^[+:]/,
];
const HOOKED_GIT_COMMANDS = [
  'git commit',
  'git push',
  'git merge',
  'git rebase',
  'git cherry-pick',
  'git revert',
  'git am',
  'git pull',
];

const REMOTE_DATABASE_OPTIONS = ['--linked', '--project-ref', '--project-id', '--db-url'];
const GUARDED_GIT_SETTINGS = [/^credential\./i, /^core\.hookspath$/i];
const SIGNED_GIT_COMMANDS = ['git commit', 'git tag', 'git merge', 'git rebase'];
const GREP_COMMANDS = ['grep', 'egrep', 'fgrep'];
const RECURSIVE_GREP_OPTIONS = [/^-[a-zA-Z]*[rR]/, /^--(?:dereference-)?recursive$/];
const UNIGNORING_RG_OPTIONS = [/^-[a-zA-Z]*u/, /^--no-ignore/, '--unrestricted'];

export const FORBIDDEN_COMMANDS = [
  { command: 'supabase', unless: LOCAL_SUPABASE_COMMANDS, reason: HOSTED_SUPABASE },
  { command: ['supabase', ...PACKAGE_MANAGERS], withAny: REMOTE_DATABASE_OPTIONS, reason: REMOTE_DATABASE },
  { command: PACKAGE_MANAGERS, withAny: ['db:push'], reason: 'Pushing migrations to the hosted database' },
  { command: 'vercel', reason: 'The Vercel CLI' },
  { command: 'gh workflow run', withAny: [/(?:^|\/)release(?:\.ya?ml)?$/i], reason: RELEASE_WORKFLOW },
  { command: 'gh api', withAny: [/\/workflows\/release\.ya?ml\/dispatches/i], reason: RELEASE_WORKFLOW },

  { command: CREDENTIAL_HELPERS, reason: 'Reading git credentials' },
  { command: 'git config', withAny: GUARDED_GIT_SETTINGS, reason: 'Changing git credentials or hooks' },
  { command: ['gh secret', 'gh variable'], reason: SECRETS_AND_VARIABLES },
  { command: 'gh api', withAny: [/\/(?:secrets|variables)(?:[/?]|$)/i], reason: SECRETS_AND_VARIABLES },
  { command: 'gh api', withAny: [/\/environments\/production\b/i], reason: PRODUCTION_ENVIRONMENT },
  { command: 'gh auth', unless: ['status'], reason: GITHUB_TOKEN_HANDLING },
  { command: 'gh auth status', withAny: ['--show-token', /^-[a-z]*t[a-z]*$/], reason: GITHUB_TOKEN_HANDLING },
  { command: CREDENTIAL_STORES, reason: 'Reading the system credential store' },

  { command: 'git push', withAny: FORCE_PUSH_OPTIONS, reason: FORCE_PUSH },
  { command: 'git push', withAny: [/^(?:[^:]+:)?(?:refs\/heads\/)?main$/], reason: 'Pushing to main' },
  { command: HOOKED_GIT_COMMANDS, withAny: ['--no-verify'], reason: SKIPPED_HOOKS },
  { command: 'git commit', withAny: [/^-[a-ln-z]*n/], reason: SKIPPED_HOOKS },
  { command: SIGNED_GIT_COMMANDS, withAny: ['--no-gpg-sign'], reason: 'Skipping commit signing' },

  { command: ['pwsh', 'powershell'], withAny: [/^-e(?:c|n\w*)?$/i], reason: ENCODED_COMMAND },
  { command: Object.keys(SHELLS), hasNoArguments: true, reason: PIPED_COMMANDS },
  { command: Object.keys(SHELLS), withAny: ['-s', '-', /^<<</], reason: PIPED_COMMANDS },

  { command: GREP_COMMANDS, withAny: RECURSIVE_GREP_OPTIONS, reason: RECURSIVE_GREP, instead: SEARCH_WITH_RG },
  { command: 'rg', withAny: UNIGNORING_RG_OPTIONS, reason: IGNORED_FILES_SEARCH },

  { command: 'set', hasNoArguments: true, reason: ENVIRONMENT_VARIABLES },
  { command: ['env', 'export', 'declare', 'typeset'], hasOnlyOptions: true, reason: ENVIRONMENT_VARIABLES },
  { command: 'printenv', reason: ENVIRONMENT_VARIABLES },
];

const HISTORY_ACTIONS = [
  'commit',
  'push',
  'merge',
  'rebase',
  'reset',
  'revert',
  'cherry-pick',
  'clean',
  'restore',
  'rm',
  'am',
  'gc',
  'filter-branch',
  'filter-repo',
  'update-ref',
  'pull',
  'apply',
];
const GITHUB_READS = [
  'pr view',
  'pr list',
  'pr diff',
  'pr checks',
  'pr status',
  'issue view',
  'issue list',
  'issue status',
  'run list',
  'run view',
  'run watch',
  'workflow list',
  'workflow view',
  'release list',
  'release view',
  'repo view',
  'label list',
  'search',
  'status',
  'api',
  'auth status',
  'help',
  '--help',
  'version',
  '--version',
];
const DEPENDENCY_ACTIONS = [
  'add',
  'remove',
  'rm',
  'r',
  'uninstall',
  'un',
  'update',
  'up',
  'upgrade',
  'link',
  'unlink',
  'patch',
  'patch-commit',
  'pkg set',
  'pkg delete',
];
const TAG_WRITE_OPTIONS = [
  /^[^-]/,
  '-d',
  '--delete',
  '-f',
  '--force',
  '-a',
  '--annotate',
  '-s',
  '--sign',
  '-m',
  '--message',
  '-F',
];
const TAG_READ_OPTIONS = ['-l', '--list', '--merged', '--no-merged', '--contains', '--no-contains', '--points-at'];
const LOCAL_DATA_WIPES = PACKAGE_MANAGERS.flatMap((manager) => [
  `${manager} db:reset`,
  `${manager} run db:reset`,
  `${manager} clean`,
  `${manager} run clean`,
]);
const LOCAL_DATABASE_STOPS = PACKAGE_MANAGERS.flatMap((manager) => [`${manager} db:stop`, `${manager} run db:stop`]);
const DOCKER_REMOVALS = [
  'docker volume rm',
  'docker volume remove',
  'docker container rm',
  'docker container remove',
  'docker image rm',
  'docker image remove',
  'docker volume prune',
  'docker system prune',
  'docker image prune',
  'docker container prune',
  'docker rm',
  'docker rmi',
];

export const APPROVAL_COMMANDS = [
  { command: HISTORY_ACTIONS.map((action) => `git ${action}`) },
  { command: 'git stash', unless: ['list', 'show'] },
  { command: 'git tag', unless: TAG_READ_OPTIONS, withAny: TAG_WRITE_OPTIONS },
  { command: 'git branch', withAny: [/^-[a-zA-Z]*[dDmMf][a-zA-Z]*$/, '--delete', '--move', '--force'] },
  { command: 'git checkout' },
  { command: 'git switch', withAny: ['--discard-changes', '--force', '-f', '-C'] },
  { command: 'git worktree remove' },

  { command: 'gh', unless: GITHUB_READS },
  { command: 'gh api', withAny: [/^-[XfF]/, '--method', '--field', '--raw-field', '--input'] },

  { command: PACKAGE_MANAGERS.flatMap((manager) => DEPENDENCY_ACTIONS.map((action) => `${manager} ${action}`)) },
  { command: ['pnpm install', 'pnpm i', 'npm install', 'npm i', 'npm in'], withAny: [/^[^-]/] },
  { command: PACKAGE_MANAGERS.map((manager) => `${manager} audit`), withAny: ['fix', '--fix'] },
  { command: 'npm ci' },

  { command: 'rm', withAny: [/^-(?:[dfirv]*r[dfirv]*|recurse)$/i, '--recursive'] },
  { command: ['remove-item', 'ri', 'rd', 'rmdir', 'del', 'erase'] },
  { command: 'find', withAny: ['-delete'] },
  { command: 'patch' },
  { command: LOCAL_DATA_WIPES },
  { command: 'supabase db reset' },
  { command: 'supabase stop', withAny: ['--no-backup'] },
  { command: LOCAL_DATABASE_STOPS, withAny: ['--no-backup'] },
  { command: DOCKER_REMOVALS },
  { command: 'docker compose', withAny: ['down'] },
];
