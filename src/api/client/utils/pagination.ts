import type { PostgrestResponse } from '@supabase/supabase-js';

import { IDS_PER_REQUEST, ROWS_PER_PAGE } from '../consts';

export const readAllRows = async <TRow>(
  readPage: (from: number, to: number) => PromiseLike<PostgrestResponse<TRow>>,
  from = 0,
): Promise<TRow[]> => {
  const { data, error } = await readPage(from, from + ROWS_PER_PAGE - 1);

  if (error) throw error;

  const rows = data ?? [];

  if (rows.length < ROWS_PER_PAGE) return rows;

  return [...rows, ...(await readAllRows(readPage, from + ROWS_PER_PAGE))];
};

export const readRowsByIds = async <TRow>(
  ids: string[],
  readPage: (chunk: string[], from: number, to: number) => PromiseLike<PostgrestResponse<TRow>>,
): Promise<TRow[]> => {
  const chunks = Array.from({ length: Math.ceil(ids.length / IDS_PER_REQUEST) }, (_, index) =>
    ids.slice(index * IDS_PER_REQUEST, (index + 1) * IDS_PER_REQUEST),
  );
  const rowsByChunk = await Promise.all(chunks.map((chunk) => readAllRows((from, to) => readPage(chunk, from, to))));

  return rowsByChunk.flat();
};
