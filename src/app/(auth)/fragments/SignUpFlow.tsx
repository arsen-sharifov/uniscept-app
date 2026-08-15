'use client';

import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type SubmitEvent, useMemo, useState } from 'react';

import {
  acceptWorkspaceInvitation,
  completeInvitedAccount,
  getMyInvitations,
  signUp,
  verifyInviteCode,
} from '@api/client';
import { Stepper, Tooltip } from '@/components';
import { useTranslations } from '@/i18n';
import { event } from '@/lib/events';
import { formatPlanPrice, mergePlansWithTranslations } from '@/lib/pricing';

import { AuthButton } from './AuthButton';
import { AuthHeading } from './AuthHeading';
import { AuthInput } from './AuthInput';
import { AuthLabel } from './AuthLabel';
import { AuthLink } from './AuthLink';

interface ISignUpFlowProps {
  mode?: 'signup' | 'invite';
  lockedEmail?: string;
}

export const SignUpFlow = ({ mode = 'signup', lockedEmail }: ISignUpFlowProps) => {
  const isInvite = mode === 'invite';

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(lockedEmail ?? '');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const t = useTranslations();
  const plans = useMemo(() => mergePlansWithTranslations(t), [t]);
  const { signUp: signUpT, placeholders, errors: authErrors } = t.auth;
  const { planStep, accountStep } = signUpT;
  const periods = t.landing.pricing.periods;
  const copy = isInvite
    ? {
        heading: signUpT.inviteHeading,
        subtitle: signUpT.inviteSubtitle,
        submit: accountStep.join,
        submitting: accountStep.joining,
      }
    : {
        heading: signUpT.heading,
        subtitle: signUpT.subtitle,
        submit: accountStep.submit,
        submitting: accountStep.submitting,
      };

  const lockedPlans = useMemo(
    () =>
      plans
        .filter((p) => p.period !== undefined)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.period
            ? `${formatPlanPrice(p.price, planStep.free)}/${periods[p.period]}`
            : formatPlanPrice(p.price, planStep.free),
        })),
    [plans, periods, planStep.free],
  );

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isInvite) {
      const { error: completeError } = await completeInvitedAccount(name, password);

      if (completeError) {
        event.error(completeError, { context: 'auth.completeInvite' });
        setLoading(false);

        return;
      }

      const invitations = await getMyInvitations().catch(() => []);
      await Promise.all(
        invitations.map((invitation) => acceptWorkspaceInvitation(invitation.id).catch(() => undefined)),
      );

      router.push('/platform');

      return;
    }

    const valid = await verifyInviteCode(inviteCode).catch((verifyError: unknown) => {
      event.error(verifyError, { context: 'auth.verifyInvite' });

      return null;
    });

    if (valid === null) {
      setLoading(false);

      return;
    }

    if (!valid) {
      setError(authErrors.invalidInviteCode);
      setLoading(false);

      return;
    }

    const { error: authError } = await signUp(email, password, name);

    if (authError) {
      event.error(authError, { context: 'auth.signUp' });
      setLoading(false);

      return;
    }

    router.push('/login?emailSent=true');
  };

  return (
    <div className="w-full max-w-sm">
      <AuthHeading
        title={step === 1 ? planStep.heading : copy.heading}
        subtitle={step === 1 ? planStep.subtitle : copy.subtitle}
      />

      <div className="mb-6">
        <Stepper steps={[signUpT.steps.plan, signUpT.steps.account]} currentStep={step} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--hero-ground-muted)] uppercase">
              {planStep.available}
            </p>
            <button
              type="button"
              className="w-full cursor-default rounded-xl border border-[color:var(--hero-lime)]/45 bg-[color:var(--hero-lime)]/10 px-4 py-3 text-left transition-colors duration-200 focus-visible:border-[color:var(--hero-lime)] focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[color:var(--hero-lime)]">
                    <div className="h-2.5 w-2.5 rounded-full bg-[color:var(--hero-lime)] shadow-[0_0_10px_var(--hero-lime-glow)]" />
                  </div>
                  <span className="font-grotesk text-sm font-semibold text-[color:var(--hero-ground-text)]">
                    {planStep.betaPlan}
                  </span>
                </div>
                <span className="rounded-md border border-[color:var(--hero-lime)]/40 bg-[color:var(--hero-lime)]/10 px-2 py-0.5 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--hero-accent-text)] uppercase">
                  {planStep.free}
                </span>
              </div>
              <p className="mt-1.5 ml-8 font-grotesk text-xs leading-relaxed text-[color:var(--hero-ground-muted)]">
                {planStep.betaDescription}
              </p>
            </button>
          </div>

          <div>
            <p className="mb-2 font-mono-ui text-[10px] font-bold tracking-[0.14em] text-[color:var(--hero-ground-muted)] uppercase">
              {planStep.comingSoon}
            </p>
            <div className="space-y-2">
              {lockedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-xl border border-[color:var(--hero-hairline)] bg-[color:var(--hero-chip-bg)] px-4 py-3 opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <Lock aria-hidden className="h-4 w-4 shrink-0 text-[color:var(--hero-ground-muted)]" />
                    <span className="font-grotesk text-sm font-medium text-[color:var(--hero-ground-muted)]">
                      {plan.name}
                    </span>
                  </div>
                  <span className="font-mono-ui text-[11px] tracking-[0.04em] text-[color:var(--hero-ground-muted)]">
                    {plan.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center font-grotesk text-xs leading-relaxed text-[color:var(--hero-ground-muted)]">
            {planStep.paidPlansNote}
            <br />
            {planStep.earlyBirdNote}
          </p>

          <AuthButton
            onClick={() => {
              setError('');
              setStep(2);
            }}
            className="flex w-full items-center justify-center gap-2"
          >
            {planStep.continue}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </AuthButton>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isInvite && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5">
                <AuthLabel htmlFor="invite-code">{accountStep.inviteCode}</AuthLabel>
                <Tooltip text={accountStep.inviteCodeTooltip} />
              </div>
              <AuthInput
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                placeholder={accountStep.inviteCodePlaceholder}
              />
            </div>
          )}

          <div>
            <AuthLabel htmlFor="name" className="mb-1.5">
              {accountStep.name}
            </AuthLabel>
            <AuthInput
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus={isInvite}
              placeholder={placeholders.name}
            />
          </div>

          <div>
            <AuthLabel htmlFor="email" className="mb-1.5">
              {accountStep.email}
            </AuthLabel>
            <AuthInput
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isInvite}
              placeholder={placeholders.email}
            />
            {isInvite && (
              <p className="mt-1.5 flex items-center gap-1.5 font-grotesk text-xs text-[color:var(--hero-ground-muted)]">
                <Lock aria-hidden className="h-3 w-3 shrink-0" />
                {accountStep.emailLocked}
              </p>
            )}
          </div>

          <div>
            <AuthLabel htmlFor="password" className="mb-1.5">
              {accountStep.password}
            </AuthLabel>
            <AuthInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={placeholders.password}
            />
          </div>

          {error && <p className="font-grotesk text-sm text-[color:var(--hero-refuted)]">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep(1);
              }}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-[color:var(--hero-hairline-strong)] bg-[color:var(--hero-chip-bg)] px-4 py-2.5 font-grotesk text-sm font-medium text-[color:var(--hero-ground-text)] transition-colors duration-200 hover:bg-[color:var(--hero-chip-hover)] focus-visible:ring-2 focus-visible:ring-[color:var(--hero-lime-glow)] focus-visible:outline-none active:bg-[color:var(--hero-chip-strong)]"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              {accountStep.back}
            </button>
            <AuthButton type="submit" disabled={loading} className="flex-1">
              {loading ? copy.submitting : copy.submit}
            </AuthButton>
          </div>
        </form>
      )}

      {!isInvite && (
        <p className="mt-6 text-center font-grotesk text-sm text-[color:var(--hero-ground-muted)]">
          {signUpT.hasAccount} <AuthLink href="/login">{signUpT.signInLink}</AuthLink>
        </p>
      )}
    </div>
  );
};
