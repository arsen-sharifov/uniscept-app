import { EXTERNAL_WRITE, UNKNOWN_INTEGRATION } from '../consts/messages.mjs';
import { READ_TOOL_PREFIXES, READ_TOOL_SUFFIX, TOOL_NAMESPACE } from '../consts/tools.mjs';
import { ACCOUNT_TOOLS, LOCAL_MCP_SERVERS, PROJECT_SERVICES } from '../rules.mjs';
import { ask, deny } from '../utils/results.mjs';

export const checkIntegrations = ({ name, isMcp, server, tool }) => {
  if (ACCOUNT_TOOLS.includes(name)) return deny(UNKNOWN_INTEGRATION);
  if (!isMcp || LOCAL_MCP_SERVERS.includes(server)) return null;
  if (!PROJECT_SERVICES.some((service) => `${server}/${tool}`.startsWith(service))) return deny(UNKNOWN_INTEGRATION);

  const action = tool.toLowerCase().replaceAll('-', '_').replace(TOOL_NAMESPACE, '');
  const isRead =
    action.endsWith(READ_TOOL_SUFFIX) ||
    READ_TOOL_PREFIXES.some((prefix) => action === prefix || action.startsWith(`${prefix}_`));

  if (isRead) return null;

  return ask(EXTERNAL_WRITE, { kind: 'integration', server, tool });
};
