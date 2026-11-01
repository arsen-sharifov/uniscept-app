import { readFileSync } from 'node:fs';

import {
  APPS_SERVER,
  CODEX_CONFIG,
  CODEX_RULES,
  CONFIG_SECTION,
  CONFIG_STRING,
  PROMPT_RULE,
} from '../consts/codex.mjs';

const readLine = ({ section, settings }, line) => {
  const header = CONFIG_SECTION.exec(line)?.[1];
  const [, key, value] = CONFIG_STRING.exec(line) ?? [];

  if (header) return { section: header, settings };
  if (!key) return { section, settings };

  return { section, settings: { ...settings, [`${section}.${key}`]: value } };
};

const readSettings = () =>
  readFileSync(CODEX_CONFIG, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .reduce(readLine, { section: '', settings: {} }).settings;

export const readPromptRules = () =>
  [...readFileSync(CODEX_RULES, 'utf8').matchAll(PROMPT_RULE)].map(([, pattern]) => JSON.parse(pattern));

export const findApprovalMode = ({ server, tool }) => {
  const settings = readSettings();

  if (server !== APPS_SERVER) {
    return (
      settings[`mcp_servers.${server}.tools.${tool}.approval_mode`] ??
      settings[`mcp_servers.${server}.default_tools_approval_mode`]
    );
  }

  const [app, ...appTool] = tool.split('__');

  return (
    settings[`apps.${app}.tools.${appTool.join('__')}.approval_mode`] ??
    settings[`apps.${app}.default_tools_approval_mode`] ??
    settings['apps._default.default_tools_approval_mode']
  );
};
