export const groupBy = <TItem>(items: readonly TItem[], keyOf: (item: TItem) => string): Map<string, TItem[]> =>
  items.reduce((groups, item) => {
    const key = keyOf(item);
    const group = groups.get(key) ?? [];
    group.push(item);

    return groups.set(key, group);
  }, new Map<string, TItem[]>());

export const uniqueBy = <TItem>(items: readonly TItem[], keyOf: (item: TItem) => string): TItem[] => {
  const keys = items.map(keyOf);

  return items.filter((item, index) => keys.indexOf(keyOf(item)) === index);
};
