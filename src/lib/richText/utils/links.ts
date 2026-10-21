import { MAX_LINK_LENGTH, SAFE_LINK_PROTOCOLS, URL_SCHEME_PATTERN, WHITESPACE_PATTERN } from '../consts';

const toUrl = (value: string): URL | null => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

export const isSafeLink = (href: string): boolean =>
  href.length <= MAX_LINK_LENGTH && SAFE_LINK_PROTOCOLS.has(toUrl(href)?.protocol ?? '');

const isEmailAddress = (value: string): boolean => {
  const [local, domain, ...rest] = value.split('@');

  return (
    rest.length === 0 &&
    Boolean(local) &&
    Boolean(domain?.includes('.')) &&
    !value.includes('/') &&
    !WHITESPACE_PATTERN.test(value)
  );
};

const withScheme = (value: string): string => {
  if (URL_SCHEME_PATTERN.test(value)) return value;
  if (isEmailAddress(value)) return `mailto:${value}`;

  return `https://${value}`;
};

export const normalizeLink = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  const href = toUrl(withScheme(value))?.href;

  return href && isSafeLink(href) ? href : null;
};
