'use client';

import { type SubmitEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from '@hooks';
import { createClient } from '@/lib/supabase/client';
import { signIn } from '@api/client';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const emailSent = searchParams.get('emailSent') === 'true';

  const t = useTranslations();
  const { signIn: signInT, placeholders } = t.auth;

  useEffect(() => {
    if (!emailSent) return;

    const interval = setInterval(async () => {
      const {
        data: { session },
      } = await createClient().auth.getSession();
      if (session) {
        clearInterval(interval);
        router.push('/platform');
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [emailSent, router]);

  const handleLogin = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/platform');
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-black">{signInT.heading}</h1>
        <p className="mt-1 text-sm text-black/50">{signInT.subtitle}</p>
      </div>

      {emailSent && (
        <div className="mb-4 rounded-lg bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-600">
          {signInT.emailSent}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-black/70"
          >
            {signInT.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:border-black/30"
            placeholder={placeholders.email}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-black/70"
          >
            {signInT.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:border-black/30"
            placeholder={placeholders.password}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/80 disabled:opacity-50"
        >
          {loading ? signInT.submitting : signInT.submit}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/50">
        {signInT.noAccount}{' '}
        <Link
          href="/signup"
          className="font-medium text-black transition-colors duration-200 hover:underline"
        >
          {signInT.signUpLink}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
