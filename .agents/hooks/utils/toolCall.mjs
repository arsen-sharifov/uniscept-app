import { resolvePath } from './paths.mjs';
import { INVALID_TOOL_CALL } from '../consts/messages.mjs';
import {
  FILE_WRITE_MCP_TOOLS,
  FILE_WRITE_TOOLS,
  OUTPUT_FILE_FIELD,
  PATCH_PATH,
  PATCH_TOOL,
  PATH_FIELDS,
  RESOURCE_TOOL,
} from '../consts/tools.mjs';

const readCommand = (toolInput) => toolInput.command ?? toolInput.cmd ?? '';

const readName = (toolName, toolInput) =>
  RESOURCE_TOOL.test(toolName) && typeof toolInput.server === 'string'
    ? `mcp__${toolInput.server}__get_resource`
    : toolName;

const readPatchPaths = (toolInput) =>
  [...[readCommand(toolInput)].flat().join('\n').matchAll(PATCH_PATH)].map(([, path]) => path.trim());

const readFieldPaths = (toolInput) =>
  PATH_FIELDS.flatMap((field) => toolInput[field] ?? []).filter((path) => typeof path === 'string');

export const readToolCall = (input) => {
  if (!input || typeof input.tool_name !== 'string' || !input.tool_input || typeof input.tool_input !== 'object') {
    throw new Error(INVALID_TOOL_CALL);
  }

  const { tool_name: name, tool_input: toolInput } = input;
  const [prefix, server = '', ...toolParts] = readName(name, toolInput).split('__');
  const tool = toolParts.join('__');
  const isPatch = name === PATCH_TOOL || tool === PATCH_TOOL;
  const sessionDirectory = input.cwd ?? process.cwd();
  const directory = resolvePath(toolInput.workdir ?? toolInput.cwd ?? sessionDirectory, sessionDirectory);
  const paths = isPatch ? readPatchPaths(toolInput) : readFieldPaths(toolInput);

  return {
    input: toolInput,
    name,
    isMcp: prefix === 'mcp' && Boolean(server),
    server,
    tool,
    isPatch,
    isWrite:
      isPatch ||
      FILE_WRITE_TOOLS.includes(name) ||
      FILE_WRITE_MCP_TOOLS.includes(tool) ||
      typeof toolInput[OUTPUT_FILE_FIELD] === 'string',
    directory,
    paths: paths.map((path) => resolvePath(path, directory)),
    command: readCommand(toolInput),
    agentType: input.agent_type,
  };
};
