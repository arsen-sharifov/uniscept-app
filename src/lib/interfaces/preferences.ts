export interface IPreferences {
  theme: 'light' | 'dark' | 'system';
  snapToGrid: boolean;
  showGrid: boolean;
  showMinimap: boolean;
  defaultZoom: number;
  emailMentions: boolean;
  emailComments: boolean;
  emailInvites: boolean;
  emailDigest: boolean;
}

export type TPreferenceUpdater = <Key extends keyof IPreferences>(
  key: Key,
  value: IPreferences[Key]
) => void;
