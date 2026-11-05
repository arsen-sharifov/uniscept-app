export const BLOCKED_PREFIX = "Blocked by the project's assistant limits (see AGENTS.md):";
export const ASK_PREFIX = 'Assistant limits:';
export const GUARD_FAILURE = 'The assistant guard could not check this call:';
export const UNKNOWN_ADAPTER = 'Unknown hook adapter:';
export const INVALID_TOOL_CALL = 'Expected a tool name and tool input';
export const INVALID_PROMPT = 'Expected the prompt text';

export const LEFT_TO_PERSON = 'is left to the person. Ask them to do it.';
export const SECRET_FILES = 'Reading files with secrets';
export const SIGNED_IN_SITE =
  "carries the person's session and is left to a person. Use the local app, or the CLI and integrations, which ask before writes.";
export const UNKNOWN_INTEGRATION = 'This integration is not part of the project setup';
export const READ_ONLY_AGENT =
  'The verifier only checks the app in the browser and saves nothing but screenshots in artifacts/verify. Report the problem instead.';
export const PROMPT_SECRET =
  'so it was not sent. Remove the value and send the prompt again: an assistant never needs the secret itself, only the name of the variable or the file that holds it.';

export const COMMAND_APPROVAL = 'needs approval.';
export const SETUP_APPROVAL = 'Changing the assistant setup or the .git folder needs approval.';
export const EXTERNAL_WRITE = 'External writes need approval for this specific action.';

export const CODEX_HINTS = {
  command:
    'Codex asks only when a rule in .codex/rules matches the start of the plain command, so drop wrappers, prefixes and comments, write paths with forward slashes and put the subcommand and its flags first, or ask the person to run it.',
  setup:
    'Write the change as a patch file outside the setup folders, show it, and apply it with git apply, which Codex asks about.',
  integration: 'This tool is not set to prompt in .codex/config.toml, so ask the person to do it.',
};
export const GENERIC_HINT = 'This assistant cannot ask for approval, so ask the person to do it.';
