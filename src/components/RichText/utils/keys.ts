import type { IKeyedItem } from '@interfaces';

export const withContentKeys = <TItem>(items: readonly TItem[]): IKeyedItem<TItem>[] => {
  const occurrences = new Map<string, number>();

  return items.map((item) => {
    const content = JSON.stringify(item);
    const occurrence = occurrences.get(content) ?? 0;
    occurrences.set(content, occurrence + 1);

    return { key: `${content}#${occurrence}`, item };
  });
};
