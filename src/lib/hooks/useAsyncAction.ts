'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { SUCCESS_RESET_DELAY_MS } from '@constants';
import { event } from '@/lib/events';

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const run = useCallback(async (action: () => Promise<void>, errorMessage: string | ((error: unknown) => string)) => {
    setLoading(true);
    setSuccess(false);
    setError(null);
    try {
      await action();
      setSuccess(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setSuccess(false), SUCCESS_RESET_DELAY_MS);
    } catch (error) {
      event.error(error, { toast: false, context: 'asyncAction' });
      setError(typeof errorMessage === 'function' ? errorMessage(error) : errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    success,
    error,
    run,
    setError,
  };
};
