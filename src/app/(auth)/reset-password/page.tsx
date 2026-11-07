'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { type SubmitEvent, useState } from 'react';

import { MIN_PASSWORD_LENGTH } from '@constants';
import { completePasswordReset, verifyPasswordReset } from '@api/client';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';

import { AuthButton, AuthField, AuthHeading, AuthLink, AuthNotice } from '../fragments';
import { isUnfinishedInvitee } from '../utils';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLinkRejected, setIsLinkRejected] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [tokenHash] = useState(() => searchParams.get('token_hash'));

  const t = useTranslations();

  const verifyLink = async (hash: string) => {
    const { data, error: verifyError } = await verifyPasswordReset(hash);
    const user = data.user;

    if (user) {
      window.history.replaceState(null, '', window.location.pathname);
      setIsVerified(true);

      return user;
    }

    if (verifyError?.code === 'otp_expired') {
      event.error(verifyError, { toast: false, context: 'auth.verifyPasswordReset' });
      setIsLinkRejected(true);

      return null;
    }

    event.error(verifyError, { title: t.auth.errors.resetFailed, context: 'auth.verifyPasswordReset' });

    return null;
  };

  const handleSubmit = async (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.auth.resetPassword.passwordMismatch);

      return;
    }

    if (!tokenHash) return;

    setLoading(true);

    if (!isVerified) {
      const user = await verifyLink(tokenHash);

      if (!user) {
        setLoading(false);

        return;
      }

      if (isUnfinishedInvitee(user)) {
        router.replace('/join');

        return;
      }
    }

    const { error: updateError } = await completePasswordReset(password);

    if (updateError) {
      event.error(updateError, { title: t.auth.errors.resetFailed, context: 'auth.completePasswordReset' });
      setLoading(false);

      return;
    }

    event.success(t.auth.resetPassword.updated);
    router.replace('/platform');
  };

  if (!tokenHash || isLinkRejected) {
    return (
      <div className="w-full max-w-sm">
        <AuthHeading title={t.auth.resetPassword.rejectedHeading} subtitle={t.auth.resetPassword.rejectedSubtitle} />

        <AuthNotice tone="alert">{t.auth.resetPassword.rejected}</AuthNotice>

        <p className="mt-6 text-center font-grotesk text-sm text-[color:var(--hero-ground-muted)]">
          <AuthLink href="/forgot-password">{t.auth.resetPassword.requestNew}</AuthLink>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <AuthHeading title={t.auth.resetPassword.heading} subtitle={t.auth.resetPassword.subtitle} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="new-password"
          label={t.auth.resetPassword.password}
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(inputEvent) => setPassword(inputEvent.target.value)}
          required
          autoFocus
          minLength={MIN_PASSWORD_LENGTH}
          placeholder={t.auth.placeholders.password}
        />

        <AuthField
          id="confirm-password"
          label={t.auth.resetPassword.confirmPassword}
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(inputEvent) => setConfirmPassword(inputEvent.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          placeholder={t.auth.placeholders.password}
        />

        {error && (
          <p role="alert" className="font-grotesk text-sm text-[color:var(--hero-refuted)]">
            {error}
          </p>
        )}

        <AuthButton type="submit" disabled={loading} className="w-full">
          {loading ? t.auth.resetPassword.submitting : t.auth.resetPassword.submit}
        </AuthButton>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
