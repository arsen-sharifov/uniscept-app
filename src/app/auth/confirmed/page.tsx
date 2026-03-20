'use client';

import { CircleCheck } from 'lucide-react';
import { Logo } from '@/components';
import { useTranslations } from '@hooks';

const ConfirmedPage = () => {
  const { confirmed } = useTranslations().auth;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <Logo className="mb-12 text-2xl" />

      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
          <CircleCheck className="h-8 w-8 text-emerald-500" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-black">
          {confirmed.heading}
        </h1>
        <p className="text-sm leading-relaxed text-black/50">
          {confirmed.message}
        </p>

        <button
          onClick={() => window.close()}
          className="mt-8 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-black/80"
        >
          {confirmed.close}
        </button>
      </div>
    </div>
  );
};

export default ConfirmedPage;
