'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { deleteAccount, getUser, updateUserMetadata, updateEmail, updatePassword } from '@api/client';

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

  const updateProfile = async (name: string) => {
    const { data, error } = await updateUserMetadata(name);
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

  const changePassword = async (password: string) => {
    const { error } = await updatePassword(password);
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
