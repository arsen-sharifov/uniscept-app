import type { User } from '@supabase/supabase-js';
import { vi } from 'vitest';

import type { IChangePasswordPayload, IUserProfileUpdate } from '@interfaces';

export const addUserBadge = vi.fn();
export const deleteAccount = vi.fn();
export const getPreferences = vi.fn();
export const getUser = vi.fn();
export const signOut = vi.fn();
export const updateEmail = vi.fn();
export const updatePassword = vi.fn();
export const updateUserMetadata = vi.fn();
export const upsertPreferences = vi.fn();

export const USER_UNAVAILABLE = { data: { user: null }, error: null };

export const USER_RESPONSE = { data: { user: { id: 'user-1' } }, error: null } as never;

export const OUTSIDER_RESPONSE = { data: { user: { id: 'user-3' } }, error: null } as never;

export const USER_WITH_METADATA_RESPONSE = {
  data: { user: { id: 'user-1', user_metadata: {} } },
  error: null,
} as never;

export const NAMED_USER = { id: 'user-1', email: 'user-1@uniscept.dev', user_metadata: { name: 'Arsen' } };

export const RENAMED_USER = { id: 'user-1', email: 'user-1@uniscept.dev', user_metadata: { name: 'Ada Lovelace' } };

export const NAMED_USER_RESPONSE = { data: { user: NAMED_USER }, error: null } as never;

export const RENAMED_USER_RESPONSE = { data: { user: RENAMED_USER }, error: null } as never;

export const NAMED_ACCOUNT = {
  id: 'user-1',
  email: 'ada@uniscept.dev',
  user_metadata: { name: 'Ada' },
} as unknown as User;

export const UNNAMED_ACCOUNT = { id: 'user-1', email: 'ada@example.com', user_metadata: {} } as unknown as User;

export const PROFILE_UPDATE: IUserProfileUpdate = { name: 'Ada Lovelace', avatarIcon: null };

export const PASSWORD_PAYLOAD: IChangePasswordPayload = { currentPassword: 'old-secret', newPassword: 'new-secret' };

export const OUTAGE_ERROR = { code: 'unexpected_failure', status: 500 };

export const SAVE_ERROR = { code: 'save_failed', status: 500 };

export const API_FAILURE = new Error('network down');
