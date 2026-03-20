'use client';

import { type SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { PRICING_PLANS } from '@constants/pricing';
import { useTranslations } from '@hooks';
import { signUp, verifyInviteCode } from '@api/client';
import { Stepper, Tooltip } from '@/components';

const LOCKED_PLANS = PRICING_PLANS.filter((p) => p.period).map((p) => ({
  name: p.name,
  price: `$${p.price}/mo`,
}));

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const t = useTranslations();
  const { signUp: signUpT, placeholders, errors: authErrors } = t.auth;
  const { planStep, accountStep } = signUpT;

  const handleSignUp = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const valid = await verifyInviteCode(inviteCode);

    if (!valid) {
      setError(authErrors.invalidInviteCode);
      setLoading(false);
      return;
    }

    const { error: authError } = await signUp(email, password, name);

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/login?emailSent=true');
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-black">
          {step === 1 ? planStep.heading : signUpT.heading}
        </h1>
        <p className="mt-1 text-sm text-black/50">
          {step === 1 ? planStep.subtitle : signUpT.subtitle}
        </p>
      </div>

      <div className="mb-6">
        <Stepper
          steps={[signUpT.steps.plan, signUpT.steps.account]}
          currentStep={step}
        />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-black/30 uppercase">
              {planStep.available}
            </p>
            <button
              type="button"
              className="w-full rounded-xl border-2 border-black px-4 py-3 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-black">
                    <div className="h-2.5 w-2.5 rounded-full bg-black" />
                  </div>
                  <span className="text-sm font-semibold text-black">
                    {planStep.betaPlan}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                  {planStep.free}
                </span>
              </div>
              <p className="mt-1.5 ml-8 text-xs text-black/40">
                {planStep.betaDescription}
              </p>
            </button>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium tracking-wider text-black/30 uppercase">
              {planStep.comingSoon}
            </p>
            <div className="space-y-2">
              {LOCKED_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className="flex items-center justify-between rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3 opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-black/20" />
                    <span className="text-sm font-medium text-black/40">
                      {plan.name}
                    </span>
                  </div>
                  <span className="text-xs text-black/30">{plan.price}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-black/40">
            {planStep.paidPlansNote}
            <br />
            {planStep.earlyBirdNote}
          </p>

          <button
            type="button"
            onClick={() => {
              setError('');
              setStep(2);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/80"
          >
            {planStep.continue}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5">
              <label
                htmlFor="invite-code"
                className="text-sm font-medium text-black/70"
              >
                {accountStep.inviteCode}
              </label>
              <Tooltip text={accountStep.inviteCodeTooltip} />
            </div>
            <input
              id="invite-code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:border-black/30"
              placeholder={accountStep.inviteCodePlaceholder}
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-black/70"
            >
              {accountStep.name}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:border-black/30"
              placeholder={placeholders.name}
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-black/70"
            >
              {accountStep.email}
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
              {accountStep.password}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm transition-colors duration-200 outline-none focus:border-black/30"
              placeholder={placeholders.password}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep(1);
              }}
              className="flex items-center justify-center gap-1 rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-black/60 transition-all duration-200 hover:border-black/30 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              {accountStep.back}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/80 disabled:opacity-50"
            >
              {loading ? accountStep.submitting : accountStep.submit}
            </button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-black/50">
        {signUpT.hasAccount}{' '}
        <Link
          href="/login"
          className="font-medium text-black transition-colors duration-200 hover:underline"
        >
          {signUpT.signInLink}
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;
