'use client';

import { useCallback, useState } from 'react';
import { X } from 'lucide-react';
import type { TSettingsSection } from '@interfaces';
import { useTranslations } from '@hooks';
import { Modal } from '@/components';
import { useSettings } from './useSettings';
import { usePreferences } from './usePreferences';
import { SettingsSidebar } from './SettingsSidebar';
import {
  AppearanceSection,
  EditorSection,
  NotificationsSection,
  PlanSection,
  ProfileSection,
  SecuritySection,
} from './sections';

export interface ISettingsProps {
  onClose: () => void;
  defaultSection?: TSettingsSection;
}

export const Settings = ({
  onClose,
  defaultSection = 'profile',
}: ISettingsProps) => {
  const t = useTranslations();
  const [activeSection, setActiveSection] =
    useState<TSettingsSection>(defaultSection);
  const {
    user,
    loading,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
  } = useSettings();
  const { preferences, updatePreference } = usePreferences();

  const handleClose = useCallback(() => {
    setActiveSection(defaultSection);
    onClose();
  }, [defaultSection, onClose]);

  return (
    <Modal open onClose={handleClose} className="max-w-[1100px]" overflowHidden>
      <div className="flex h-[80vh]">
        <SettingsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="relative flex-1 overflow-y-auto px-10 py-8">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 cursor-pointer rounded-lg p-1.5 text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="mb-6 text-lg font-bold text-black">
            {t.platform.settings.sections[activeSection]}
          </h2>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : activeSection === 'profile' ? (
            <ProfileSection
              user={user}
              onUpdateProfile={updateProfile}
              onUpdateEmail={changeEmail}
            />
          ) : activeSection === 'security' ? (
            <SecuritySection
              onChangePassword={changePassword}
              onDeleteAccount={deleteAccount}
            />
          ) : activeSection === 'notifications' ? (
            <NotificationsSection
              preferences={preferences}
              onUpdate={updatePreference}
            />
          ) : activeSection === 'appearance' ? (
            <AppearanceSection />
          ) : activeSection === 'editor' ? (
            <EditorSection
              preferences={preferences}
              onUpdate={updatePreference}
            />
          ) : (
            <PlanSection user={user} />
          )}
        </div>
      </div>
    </Modal>
  );
};
