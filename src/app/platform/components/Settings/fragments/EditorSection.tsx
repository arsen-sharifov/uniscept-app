'use client';

import { Grid3X3, Map, Magnet } from 'lucide-react';
import { useTranslations } from '@hooks';
import { Tooltip } from '@/components';
import { Toggle } from '../Toggle';
import { ZOOM_OPTIONS } from '../consts';

export const EditorSection = () => {
  const t = useTranslations();
  const { editor, comingSoon } = t.platform.settings;

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-xs font-medium tracking-wider text-[color:var(--text-subtle)] uppercase">
            {editor.canvas}
          </h3>
          <Tooltip text={comingSoon} />
        </div>

        <div className="space-y-4">
          <Toggle
            icon={Magnet}
            label={editor.snapToGrid}
            description={editor.snapToGridDescription}
            checked={false}
            onChange={() => {}}
            disabled
          />
          <Toggle
            icon={Grid3X3}
            label={editor.showGrid}
            description={editor.showGridDescription}
            checked={true}
            onChange={() => {}}
            disabled
          />
          <Toggle
            icon={Map}
            label={editor.showMinimap}
            description={editor.showMinimapDescription}
            checked={false}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>

      <div className="border-t border-[color:var(--border)] pt-6">
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm font-medium text-[color:var(--text)]">{editor.defaultZoom}</label>
          <Tooltip text={comingSoon} />
        </div>
        <div className="flex gap-1 rounded-xl bg-[color:var(--surface-overlay)] p-1 opacity-50">
          {ZOOM_OPTIONS.map((zoom) => (
            <button
              key={zoom}
              type="button"
              disabled
              className="flex-1 cursor-not-allowed rounded-lg py-1.5 text-sm font-medium text-[color:var(--text-muted)]"
            >
              {zoom}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
