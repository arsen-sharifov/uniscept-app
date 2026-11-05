import { readFileSync } from 'node:fs';

import { BLOCKED_EXIT_CODE } from './consts/hooks.mjs';
import { GUARD_FAILURE, UNKNOWN_ADAPTER } from './consts/messages.mjs';

const loadAdapters = async () => {
  const [{ deliverToClaude }, { deliverToCodex }, { deliverToGeneric }] = await Promise.all([
    import('./adapters/claude.mjs'),
    import('./adapters/codex.mjs'),
    import('./adapters/generic.mjs'),
  ]);

  return { claude: deliverToClaude, codex: deliverToCodex, generic: deliverToGeneric };
};

const report = ({ output, error }) => {
  if (output) process.stdout.write(JSON.stringify(output));
  if (!error) return;

  console.error(error);
  process.exitCode = BLOCKED_EXIT_CODE;
};

try {
  const adapters = await loadAdapters();
  const { decide } = await import('./decide.mjs');
  const adapter = process.argv[2] ?? 'generic';

  if (!Object.hasOwn(adapters, adapter)) throw new Error(`${UNKNOWN_ADAPTER} ${adapter}`);

  const input = JSON.parse(readFileSync(0, 'utf8'));
  const result = decide(input);

  if (result) report(adapters[adapter](result, input.hook_event_name));
} catch (error) {
  report({ error: `${GUARD_FAILURE} ${error.message}` });
}
