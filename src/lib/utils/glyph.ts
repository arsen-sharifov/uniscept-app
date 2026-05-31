import type { TGlyphId, TGlyphLabelKey } from '@interfaces';
import { GLYPH_IDS } from '@constants';

export const isGlyphId = (value: unknown): value is TGlyphId =>
  typeof value === 'string' && (GLYPH_IDS as readonly string[]).includes(value);

export const glyphLabelKey = (id: TGlyphId): TGlyphLabelKey =>
  `glyph${(id.charAt(0).toUpperCase() + id.slice(1)) as Capitalize<TGlyphId>}`;
