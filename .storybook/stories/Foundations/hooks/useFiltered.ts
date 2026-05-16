import { useMemo } from 'react';

export const useFiltered = <T>(items: readonly T[], query: string, picker: (item: T) => string): T[] =>
  useMemo(() => {
    if (!query.trim()) return [...items];

    const q = query.toLowerCase();

    return items.filter((item) => picker(item).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);
