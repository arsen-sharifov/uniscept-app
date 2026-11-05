export const TOOL_NAMESPACE = /^(?:(?:api|notion|github)_+)+/;
export const RESOURCE_TOOL = /mcp_?resource/i;
export const READ_TOOL_PREFIXES = ['get', 'list', 'search', 'fetch', 'query', 'retrieve', 'post_search'];
export const READ_TOOL_SUFFIX = '_read';

export const FILE_WRITE_TOOLS = ['Write', 'Edit', 'MultiEdit', 'NotebookEdit'];
export const FILE_WRITE_MCP_TOOLS = ['write_file', 'edit_file', 'move_file', 'delete_file'];
export const PATH_FIELDS = ['file_path', 'path', 'paths', 'notebook_path', 'glob', 'source', 'destination', 'filename'];
export const OUTPUT_FILE_FIELD = 'filename';
export const PATCH_TOOL = 'apply_patch';
export const PATCH_PATH = /^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm;
export const HOME_PATH = /^[~$%]/;

export const FILE_URL = /\bfile:\/\/[^\s'"<>)]+/gi;
export const FILE_SCHEME = /^file:\/*/i;
export const URL_PATTERN = /(?<![\w.-])(?:https?:\/\/)?(?:[\w-]+\.)+[a-z]{2,}(?::\d+)?(?:\/[^\s'"<>\\)]*)?/gi;
