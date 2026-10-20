'use client';

import type { Editor } from '@tiptap/core';
import { ChevronLeft } from 'lucide-react';

import type { TTextColor } from '@interfaces';

import { useTranslations } from '@/i18n';
import { TEXT_COLOR_VALUES, TEXT_COLORS } from '@/lib/richText';

import { DEFAULT_SWATCH_COLOR, FOCUS_OPTIONS } from '../consts';
import { ColorSwatch } from './ColorSwatch';
import { FormatButton } from './FormatButton';
import { ToolbarDivider } from './ToolbarDivider';

interface IColorPaletteProps {
  editor: Editor;
  color: TTextColor | null;
  onDone: () => void;
}

export const ColorPalette = ({ editor, color, onDone }: IColorPaletteProps) => {
  const t = useTranslations();

  const applyColor = (next: TTextColor | null) => {
    const chain = editor.chain().focus(null, FOCUS_OPTIONS);

    if (next) chain.setMark('textColor', { color: next }).run();
    else chain.unsetMark('textColor').run();

    onDone();
  };

  return (
    <>
      <FormatButton icon={ChevronLeft} label={t.platform.canvas.formatting.back} onClick={onDone} />

      <ToolbarDivider />

      <ColorSwatch
        label={t.platform.canvas.formatting.colors.default}
        color={DEFAULT_SWATCH_COLOR}
        selected={color === null}
        onClick={() => applyColor(null)}
      />
      {TEXT_COLORS.map((option) => (
        <ColorSwatch
          key={option}
          label={t.platform.canvas.formatting.colors[option]}
          color={TEXT_COLOR_VALUES[option]}
          selected={color === option}
          onClick={() => applyColor(option)}
        />
      ))}
    </>
  );
};
