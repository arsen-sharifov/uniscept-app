'use client';

import type { IPreferences, TPreferenceUpdater } from '@interfaces';

import { useTranslations } from '@/i18n';

import { BehaviorCard } from './BehaviorCard';
import { GuidesDiorama } from './GuidesDiorama';
import { SectionHeader } from './SectionHeader';
import { SnapDiorama } from './SnapDiorama';
import { ZoomStack } from './ZoomStack';

interface IEditorSectionProps {
  preferences: IPreferences;
  onUpdate: TPreferenceUpdater;
}

export const EditorSection = ({ preferences, onUpdate }: IEditorSectionProps) => {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      <section>
        <SectionHeader
          title={t.platform.settings.editor.behaviors}
          caption={t.platform.settings.editor.behaviorsCaption}
          className="mb-1"
        />
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {t.platform.settings.editor.blurb}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BehaviorCard
            diorama={<SnapDiorama active={preferences.snapToGrid} />}
            label={t.platform.settings.editor.snapToGrid}
            description={t.platform.settings.editor.snapToGridDescription}
            checked={preferences.snapToGrid}
            onChange={(next) => onUpdate('snapToGrid', next)}
          />
          <BehaviorCard
            diorama={<GuidesDiorama active={preferences.smartGuides} />}
            label={t.platform.settings.editor.smartGuides}
            description={t.platform.settings.editor.smartGuidesDescription}
            checked={preferences.smartGuides}
            onChange={(next) => onUpdate('smartGuides', next)}
          />
        </div>
      </section>

      <section className="border-t border-[color:var(--border)] pt-6">
        <SectionHeader
          title={t.platform.settings.editor.zoom}
          caption={t.platform.settings.editor.zoomCaption}
          className="mb-1"
        />
        <p className="mb-4 max-w-md text-[12.5px] leading-relaxed text-[color:var(--text-muted)]">
          {t.platform.settings.editor.zoomBlurb}
        </p>

        <ZoomStack
          label={t.platform.settings.editor.defaultZoom}
          value={preferences.defaultZoom}
          onChange={(next) => onUpdate('defaultZoom', next)}
        />
      </section>
    </div>
  );
};
