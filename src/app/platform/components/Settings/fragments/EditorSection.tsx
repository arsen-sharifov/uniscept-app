'use client';

import type { IPreferences, TPreferenceUpdater } from '@interfaces';

import { useTranslations } from '@/i18n';

import { BehaviorCard } from './BehaviorCard';
import { GuidesDiorama } from './GuidesDiorama';
import { SnapDiorama } from './SnapDiorama';
import { ZoomStack } from './ZoomStack';

interface IEditorSectionProps {
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
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {editor.behaviors}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-label)] uppercase">
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
          <h3 className="font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--text-label)] uppercase">
            {editor.zoom}
          </h3>
          <span className="font-mono-ui text-[10px] tracking-[0.14em] text-[color:var(--text-label)] uppercase">
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
