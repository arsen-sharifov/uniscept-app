import { join } from 'node:path';

import { PROJECT_DIRECTORY } from './hooks.mjs';

export const CODEX_RULES = join(PROJECT_DIRECTORY, '.codex/rules/project.rules');
export const CODEX_CONFIG = join(PROJECT_DIRECTORY, '.codex/config.toml');
export const PROMPT_RULE = /pattern = (\[.*\]),\s*decision = "prompt"/g;
export const CONFIG_SECTION = /^\[([^\]]+)\]$/;
export const CONFIG_STRING = /^([\w.-]+)\s*=\s*"([^"]*)"$/;
export const APPS_SERVER = 'codex_apps';

export const PLAIN_SCRIPT = /^(?:[ \t]|&&|[;|]|'[^']*'|"[^"$`\\]*"|[^\s'"$`\\;&|<>(){}*?[\]!#,])*$/;
export const NATIVE_PROMPT_MODES = ['prompt', 'writes'];
