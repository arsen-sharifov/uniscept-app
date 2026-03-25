'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const run = useCallback(
    async (action: () => Promise<void>, errorMessage: string) => {
      setLoading(true);
      setSuccess(false);
      setError(null);
      try {
        await action();
        setSuccess(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setSuccess(false), 2000);
      } catch {
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, success, error, run, setError };
};
