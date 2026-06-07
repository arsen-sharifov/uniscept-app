'use client';

import type { IPreferences, TPreferenceUpdater } from '@interfaces';
import { useTranslations } from '@hooks';

import { BehaviorCard } from './BehaviorCard';
import { GuidesDiorama } from './GuidesDiorama';
import { SnapDiorama } from './SnapDiorama';
import { ZoomStack } from './ZoomStack';

export interface IEditorSectionProps {
  preferences: IPreferences;
  onUpdate: TPreferenceUpdater;
}

export const EditorSection = ({ preferences, onUpdate }: IEditorSectionProps) => {
  const t = useTranslations();
  const { editor } = t.platform.settings;

  return (
    <div className="space-y-8">
      <section>
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {editor.behaviors}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {editor.behaviorsCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">{editor.blurb}</p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BehaviorCard
            diorama={<SnapDiorama active={preferences.snapToGrid} />}
            label={editor.snapToGrid}
            description={editor.snapToGridDescription}
            checked={preferences.snapToGrid}
            onChange={(next) => onUpdate('snapToGrid', next)}
          />
          <BehaviorCard
            diorama={<GuidesDiorama active={preferences.smartGuides} />}
            label={editor.smartGuides}
            description={editor.smartGuidesDescription}
            checked={preferences.smartGuides}
            onChange={(next) => onUpdate('smartGuides', next)}
          />
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <header className="mb-1 flex items-baseline justify-between">
          <h3 className="text-[11px] font-semibold tracking-[0.18em] text-[color:var(--text-subtle)] uppercase">
            {editor.zoom}
          </h3>
          <span className="text-[10.5px] tracking-[0.16em] text-[color:var(--text-faint)] uppercase">
            {editor.zoomCaption}
          </span>
        </header>
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">{editor.zoomBlurb}</p>

        <ZoomStack
          label={editor.defaultZoom}
          value={preferences.defaultZoom}
          onChange={(next) => onUpdate('defaultZoom', next)}
        />
      </section>
    </div>
  );
};
