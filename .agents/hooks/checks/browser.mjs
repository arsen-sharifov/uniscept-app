import { LEFT_TO_PERSON, SECRET_FILES, SIGNED_IN_SITE } from '../consts/messages.mjs';
import { FILE_SCHEME, FILE_URL, URL_PATTERN } from '../consts/tools.mjs';
import { BLOCKED_SITES, BROWSER_MCP_SERVERS } from '../rules.mjs';
import { isSecret } from '../utils/paths.mjs';
import { deny } from '../utils/results.mjs';

const isUnderPath = (pathname, path) => pathname === path || pathname.startsWith(`${path}/`);

const findBlockedSite = (match) => {
  const url = match.includes('://') ? match : `https://${match}`;

  if (!URL.canParse(url)) return null;

  const { hostname, pathname } = new URL(url);

  return BLOCKED_SITES.find(
    ({ host, paths, allowedPaths = [] }) =>
      (hostname === host || hostname.endsWith(`.${host}`)) &&
      (!paths || paths.some((path) => isUnderPath(pathname, path))) &&
      !allowedPaths.some((path) => isUnderPath(pathname, path)),
  );
};

const collectStrings = (value) => {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);

  return [];
};

const findMatches = (strings, pattern) => strings.flatMap((value) => value.match(pattern) ?? []);

export const checkBrowser = ({ isMcp, server, isPatch, input }) => {
  if (!isMcp || isPatch || !BROWSER_MCP_SERVERS.includes(server)) return null;

  const strings = collectStrings(input);

  if (findMatches(strings, FILE_URL).some((url) => isSecret(url.replace(FILE_SCHEME, '/')))) {
    return deny(`${SECRET_FILES} ${LEFT_TO_PERSON}`);
  }

  const site = findMatches(strings, URL_PATTERN).map(findBlockedSite).find(Boolean);

  return site ? deny(`${site.reason} ${SIGNED_IN_SITE}`) : null;
};
