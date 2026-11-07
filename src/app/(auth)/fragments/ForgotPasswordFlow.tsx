'use client';

import { type SubmitEvent, useEffect, useState } from 'react';

import type { IPendingPasswordReset } from '@interfaces';
import { PASSWORD_RESET_RESEND_WINDOW_MS } from '@constants';
import { requestPasswordReset } from '@api/client';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { useAuthFlowStore } from '@/lib/stores';
import { restorePasswordReset, toSecondsLeft } from '@/lib/utils';

import { COUNTDOWN_TICK_MS } from '../consts';
import { AuthButton } from './AuthButton';
import { AuthField } from './AuthField';
import { AuthHeading } from './AuthHeading';
import { AuthLink } from './AuthLink';
import { AuthNotice } from './AuthNotice';

interface IForgotPasswordFlowProps {
  pendingRequest: IPendingPasswordReset | null;
}

export const ForgotPasswordFlow = ({ pendingRequest }: IForgotPasswordFlowProps) => {
  const draftEmail = useAuthFlowStore((state) => state.draftEmail);
  const rememberedRequest = useAuthFlowStore((state) => state.resetRequest);
  const [restoredRequest] = useState(() => restorePasswordReset(rememberedRequest, pendingRequest, draftEmail));
  const [email, setEmail] = useState(draftEmail);
  const [sentTo, setSentTo] = useState(restoredRequest?.email ?? null);
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(restoredRequest?.resendAt ?? 0);
  const [secondsLeft, setSecondsLeft] = useState(restoredRequest?.secondsLeft ?? 0);

  const t = useTranslations();
  const isCoolingDown = secondsLeft > 0;

  useEffect(() => {
    const store = useAuthFlowStore.getState();

    store.clearDraftEmail();
    if (restoredRequest && !store.resetRequest) {
      store.rememberResetRequest({ email: restoredRequest.email, resendAt: restoredRequest.resendAt });
    }
  }, [restoredRequest]);

  useEffect(() => {
    if (!isCoolingDown) return;

    const interval = setInterval(() => setSecondsLeft(toSecondsLeft(resendAt)), COUNTDOWN_TICK_MS);

    return () => clearInterval(interval);
  }, [isCoolingDown, resendAt]);

  const sendLink = async (address: string) => {
    setLoading(true);

    const result = await requestPasswordReset(address).catch((error: unknown) => {
      event.error(error, { title: t.auth.errors.resetRequestFailed, context: 'auth.requestPasswordReset' });

      return null;
    });

    setLoading(false);

    if (result) {
      const nextResendAt = Date.now() + PASSWORD_RESET_RESEND_WINDOW_MS;

      setResendAt(nextResendAt);
      setSecondsLeft(toSecondsLeft(nextResendAt));
      useAuthFlowStore.getState().rememberResetRequest({ email: address, resendAt: nextResendAt });
    }

    return result;
  };

  const handleSubmit = async (submitEvent: SubmitEvent) => {
    submitEvent.preventDefault();

    const address = email.trim();

    if (await sendLink(address)) setSentTo(address);
  };

  const handleResend = async (address: string) => {
    if ((await sendLink(address)) === 'sent') event.success(t.auth.forgotPassword.resent);
  };

  if (sentTo) {
    const resendLabel = isCoolingDown
      ? t('auth.forgotPassword.resendIn', { seconds: secondsLeft })
      : t.auth.forgotPassword.resend;

    return (
      <div className="w-full max-w-sm">
        <AuthHeading title={t.auth.forgotPassword.sentHeading} subtitle={t.auth.forgotPassword.sentSubtitle} />

        <AuthNotice tone="notice" className="mb-4">
          {t('auth.forgotPassword.sent', { email: sentTo })}
        </AuthNotice>

        <AuthButton onClick={() => handleResend(sentTo)} disabled={loading || isCoolingDown} className="w-full">
          {loading ? t.auth.forgotPassword.submitting : resendLabel}
        </AuthButton>

        <p className="mt-6 text-center font-grotesk text-sm text-[color:var(--hero-ground-muted)]">
          <AuthLink href="/login">{t.auth.forgotPassword.backToSignIn}</AuthLink>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <AuthHeading title={t.auth.forgotPassword.heading} subtitle={t.auth.forgotPassword.subtitle} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          id="email"
          label={t.auth.forgotPassword.email}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(inputEvent) => setEmail(inputEvent.target.value)}
          required
          autoFocus
          placeholder={t.auth.placeholders.email}
        />

        <AuthButton type="submit" disabled={loading} className="w-full">
          {loading ? t.auth.forgotPassword.submitting : t.auth.forgotPassword.submit}
        </AuthButton>
      </form>

      <p className="mt-6 text-center font-grotesk text-sm text-[color:var(--hero-ground-muted)]">
        {t.auth.forgotPassword.remembered} <AuthLink href="/login">{t.auth.signUp.signInLink}</AuthLink>
      </p>
    </div>
  );
};
