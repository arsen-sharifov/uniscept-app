'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import type { IChangePasswordPayload, IUserProfileUpdate } from '@interfaces';
import { deleteAccount, getUser, updateEmail, updatePassword, updateUserMetadata, verifyPassword } from '@api/client';

export class IncorrectCurrentPasswordError extends Error {
  constructor() {
    super('Incorrect current password');
    this.name = 'IncorrectCurrentPasswordError';
  }
}

export const useSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getUser()
      .then(({ data }) => {
        if (cancelled) {
          return;
        }

        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateProfile = async (update: IUserProfileUpdate) => {
    const { data, error } = await updateUserMetadata(update);
    if (error) {
      throw error;
    }

    setUser(data.user);
  };

  const changeEmail = async (email: string) => {
    const { error } = await updateEmail(email);
    if (error) {
      throw error;
    }
  };

  const changePassword = async ({ currentPassword, newPassword }: IChangePasswordPayload) => {
    const email = user?.email;
    if (!email) {
      throw new Error('Missing user email');
    }

    const { error: verifyError } = await verifyPassword(email, currentPassword);
    if (verifyError) {
      if (verifyError.code === 'invalid_credentials' || verifyError.status === 400) {
        throw new IncorrectCurrentPasswordError();
      }

      throw verifyError;
    }

    const { error } = await updatePassword(newPassword);
    if (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
  };
};
