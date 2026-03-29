'use client';

import { Grid3X3, Map, Magnet } from 'lucide-react';
import type { IPreferences, TPreferenceUpdater } from '@interfaces';
import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';
import { ZOOM_OPTIONS } from '../consts';
import { Toggle } from '../Toggle';

export interface IEditorSectionProps {
  preferences: IPreferences;
  onUpdate: TPreferenceUpdater;
}

export const EditorSection = ({
  preferences,
  onUpdate,
}: IEditorSectionProps) => {
  const t = useTranslations();
  const { editor, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-xs font-medium tracking-wider text-black/30 uppercase">
            {editor.canvas}
          </h3>
          <Tooltip text={comingSoon} />
        </div>

        <div className="space-y-4">
          <Toggle
            icon={Magnet}
            label={editor.snapToGrid}
            description={editor.snapToGridDescription}
            checked={preferences.snapToGrid}
            onChange={(v) => onUpdate('snapToGrid', v)}
            disabled
          />
          <Toggle
            icon={Grid3X3}
            label={editor.showGrid}
            description={editor.showGridDescription}
            checked={preferences.showGrid}
            onChange={(v) => onUpdate('showGrid', v)}
            disabled
          />
          <Toggle
            icon={Map}
            label={editor.showMinimap}
            description={editor.showMinimapDescription}
            checked={preferences.showMinimap}
            onChange={(v) => onUpdate('showMinimap', v)}
            disabled
          />
        </div>
      </div>

      <div className="border-t border-black/5 pt-6">
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm font-medium text-black/60">
            {editor.defaultZoom}
          </label>
          <Tooltip text={comingSoon} />
        </div>
        <div className="flex gap-1 rounded-xl bg-black/[0.03] p-1 opacity-50">
          {ZOOM_OPTIONS.map((zoom) => (
            <button
              key={zoom}
              disabled
              className="flex-1 cursor-not-allowed rounded-lg py-1.5 text-sm font-medium text-black/50"
            >
              {zoom}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
