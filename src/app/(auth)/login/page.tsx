'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type SubmitEvent, useEffect, useState } from 'react';

import { signIn } from '@api/client';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { createClient } from '@/lib/supabase/client';

import { AuthButton, AuthHeading, AuthInput, AuthLabel, AuthLink } from '../fragments';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      event.error(authError, { context: 'auth.signIn' });
      setLoading(false);

      return;
    }

    router.push('/platform');
  };

  return (
    <div className="w-full max-w-sm">
      <AuthHeading title={signInT.heading} subtitle={signInT.subtitle} />

      {emailSent && (
        <div className="mb-4 rounded-lg border border-[color:var(--hero-tainted)]/35 bg-[color:var(--hero-tainted)]/10 px-4 py-3 text-center font-grotesk text-sm text-[color:var(--hero-tainted)]">
          {signInT.emailSent}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <AuthLabel htmlFor="email" className="mb-1.5">
            {signInT.email}
          </AuthLabel>
          <AuthInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder={placeholders.email}
          />
        </div>

        <div>
          <AuthLabel htmlFor="password" className="mb-1.5">
            {signInT.password}
          </AuthLabel>
          <AuthInput
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder={placeholders.password}
          />
        </div>

        <AuthButton type="submit" disabled={loading} className="w-full">
          {loading ? signInT.submitting : signInT.submit}
        </AuthButton>
      </form>

      <p className="mt-6 text-center font-grotesk text-sm text-[color:var(--hero-ground-muted)]">
        {signInT.noAccount} <AuthLink href="/signup">{signInT.signUpLink}</AuthLink>
      </p>
    </div>
  );
};

export default LoginPage;
