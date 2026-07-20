import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const STORYBOOK_INDEX_PATH = 'storybook-static/index.html';
const CONTAINER_VOLUMES = [
  `${process.cwd()}:/work`,
  'uniscept-visual-node-modules:/work/node_modules',
  'uniscept-visual-corepack:/root/.cache/node/corepack',
];
const CONTAINER_ENVIRONMENT = [
  'COREPACK_ENABLE_DOWNLOAD_PROMPT=0',
  'VISUAL_CONTAINER=1',
  'npm_config_store_dir=/work/node_modules/.pnpm-store',
];

const executeCommand = (command, args, stdio = 'inherit') => {
  const { error, status } = spawnSync(command, args, { stdio });

  if (error) {
    throw error;
  }

  return status ?? 1;
};

const runVisualTests = () => {
  const {
    values: { grep, 'skip-build': skipBuild, update },
  } = parseArgs({
    options: {
      grep: { type: 'string' },
      'skip-build': { type: 'boolean', default: false },
      update: { type: 'boolean', default: false },
    },
  });
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const playwrightVersion = packageJson.devDependencies?.['@playwright/test'];

  if (typeof playwrightVersion !== 'string' || !VERSION_PATTERN.test(playwrightVersion)) {
    throw new Error('package.json must pin @playwright/test to an exact x.y.z version.');
  }

  if (skipBuild && !existsSync(STORYBOOK_INDEX_PATH)) {
    throw new Error(`${STORYBOOK_INDEX_PATH} is missing. Run without --skip-build first.`);
  }

  if (executeCommand('docker', ['info'], 'ignore') !== 0) {
    throw new Error('Docker is unavailable. Start Docker Desktop and try again.');
  }

  const playwrightArgs = ['test', ...(update ? ['--update-snapshots'] : []), ...(grep ? ['--grep', grep] : [])];
  const containerCommand = [
    'corepack enable',
    'pnpm install --frozen-lockfile --ignore-scripts',
    ...(skipBuild ? [] : ['pnpm build-storybook']),
    'CI=1 pnpm exec playwright "$@"',
  ].join(' && ');
  const playwrightImage = `mcr.microsoft.com/playwright:v${playwrightVersion}-noble`;
  const dockerArgs = [
    'run',
    '--rm',
    '--init',
    '--ipc=host',
    ...(process.stdout.isTTY ? ['--tty'] : []),
    ...CONTAINER_VOLUMES.map((volume) => `--volume=${volume}`),
    ...CONTAINER_ENVIRONMENT.map((environment) => `--env=${environment}`),
    '--workdir=/work',
    playwrightImage,
    'bash',
    '-lc',
    containerCommand,
    'visual-tests',
    ...playwrightArgs,
  ];

  return executeCommand('docker', dockerArgs);
};

try {
  process.exitCode = runVisualTests();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
