'use client';

import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  deleteAccount,
  getUser,
  updateUserMetadata,
  updateEmail,
  updatePassword,
} from '@api/client';

export const useSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const updateProfile = async (name: string) => {
    const { data, error } = await updateUserMetadata(name);
    if (error) throw error;
    setUser(data.user);
  };

  const changeEmail = async (email: string) => {
    const { error } = await updateEmail(email);
    if (error) throw error;
  };

  const changePassword = async (password: string) => {
    const { error } = await updatePassword(password);
    if (error) throw error;
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
