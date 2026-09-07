'use client';

import { X } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { IPreferences, TPreferenceUpdater, TSettingsSection } from '@interfaces';

import { Modal } from '@/components';
import { useTranslations } from '@/i18n';

import {
  AppearanceSection,
  EditorSection,
  NotificationsSection,
  PlanSection,
  ProfileSection,
  SecuritySection,
  SettingsSkeleton,
} from './fragments';
import { useSettings } from './hooks';
import { SettingsSidebar } from './SettingsSidebar';

interface ISettingsProps {
  onClose: () => void;
  preferences: IPreferences;
  updatePreference: TPreferenceUpdater;
  defaultSection?: TSettingsSection;
}

export const Settings = ({ onClose, preferences, updatePreference, defaultSection = 'profile' }: ISettingsProps) => {
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState<TSettingsSection>(defaultSection);
  const { user, loading, updateProfile, changeEmail, changePassword, deleteAccount } = useSettings();

  const handleClose = useCallback(() => {
    setActiveSection(defaultSection);
    onClose();
  }, [defaultSection, onClose]);

  const renderSection = () => {
    if (loading && (activeSection === 'profile' || activeSection === 'plan')) {
      return <SettingsSkeleton section={activeSection} />;
    }

    if (activeSection === 'profile') {
      return <ProfileSection key={user?.id} user={user} onUpdateProfile={updateProfile} onUpdateEmail={changeEmail} />;
    }

    if (activeSection === 'security') {
      return <SecuritySection onChangePassword={changePassword} onDeleteAccount={deleteAccount} />;
    }

    if (activeSection === 'notifications') {
      return <NotificationsSection />;
    }

    if (activeSection === 'appearance') {
      return <AppearanceSection preferences={preferences} onUpdate={updatePreference} />;
    }

    if (activeSection === 'editor') {
      return <EditorSection preferences={preferences} onUpdate={updatePreference} />;
    }

    return <PlanSection user={user} />;
  };

  return (
    <Modal open onClose={handleClose} width="max-w-[1100px]" overflowHidden>
      <div
        data-theme={preferences.theme}
        className="flex h-[86vh] rounded-2xl font-grotesk text-[color:var(--text)] transition-[color] duration-200 ease-out motion-reduce:transition-none"
      >
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="relative flex-1 [scrollbar-width:none] overflow-y-auto px-10 py-5 [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.platform.settings.close}
            className="absolute top-4 right-4 z-10 cursor-pointer rounded-lg p-1.5 text-[color:var(--text-subtle)] transition-colors duration-200 ease-out hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text-strong)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring-focus)] focus-visible:outline-none active:bg-[color:var(--border)] motion-reduce:transition-none"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <h2 className="mb-6 font-grotesk text-lg font-semibold tracking-tight text-[color:var(--text-strong)]">
            {t.platform.settings.sections[activeSection]}
          </h2>

          {renderSection()}
        </div>
      </div>
    </Modal>
  );
};
