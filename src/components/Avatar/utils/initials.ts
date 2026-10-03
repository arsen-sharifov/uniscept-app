export const getInitials = (name: string, fallback = 'U') =>
  (name?.trim() || fallback?.trim() || 'U')
    .split(/\s+/)
    .map((w: string) => [...w][0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
