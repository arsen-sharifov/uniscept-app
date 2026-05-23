'use client';

import { X } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { TSettingsSection } from '@interfaces';
import { useTranslations } from '@hooks';
import { Modal } from '@/components';

import {
  AppearanceSection,
  EditorSection,
  NotificationsSection,
  PlanSection,
  ProfileSection,
  SecuritySection,
} from './fragments';
import { usePreferences, useSettings } from './hooks';
import { SettingsSidebar } from './SettingsSidebar';

export interface ISettingsProps {
  onClose: () => void;
  defaultSection?: TSettingsSection;
}

export const Settings = ({ onClose, defaultSection = 'profile' }: ISettingsProps) => {
  const t = useTranslations();
  const [activeSection, setActiveSection] = useState<TSettingsSection>(defaultSection);
  const { user, loading, updateProfile, changeEmail, changePassword, deleteAccount } = useSettings();
  const { preferences, updatePreference } = usePreferences();

  const handleClose = useCallback(() => {
    setActiveSection(defaultSection);
    onClose();
  }, [defaultSection, onClose]);

  const renderSection = () => {
    if (loading) {
      return (
        <div role="status" aria-label={t.common.loading} className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[color:var(--accent)] border-t-transparent" />
        </div>
      );
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
      return <EditorSection />;
    }

    return <PlanSection user={user} />;
  };

  return (
    <Modal open onClose={handleClose} width="max-w-[1100px]" overflowHidden>
      <div
        data-theme={preferences.theme}
        className="flex h-[80vh] bg-[color:var(--surface)] text-[color:var(--text)] transition-[background-color,color] duration-300 ease-out"
      >
        <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <div className="relative flex-1 overflow-y-auto bg-[color:var(--surface)] px-10 py-8">
          <button
            type="button"
            onClick={handleClose}
            aria-label={t.platform.settings.close}
            className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-[color:var(--text-subtle)] transition-colors hover:bg-[color:var(--surface-overlay)] hover:text-[color:var(--text)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>

          <h2 className="mb-6 text-lg font-bold text-[color:var(--text-strong)]">
            {t.platform.settings.sections[activeSection]}
          </h2>

          {renderSection()}
        </div>
      </div>
    </Modal>
  );
};
