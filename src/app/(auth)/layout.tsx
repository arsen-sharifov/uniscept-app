import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 overflow-hidden bg-black lg:flex lg:flex-col lg:justify-between">
        <div className="noise-texture absolute inset-0 opacity-30" />
        <div className="dot-pattern absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute top-[10%] left-[5%] h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[5%] bottom-[15%] h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />

        <div className="relative z-10 p-10">
          <Link href="/">
            <Logo className="text-2xl text-white" />
          </Link>
        </div>

        <div className="relative z-10 p-10">
          <blockquote className="max-w-md">
            <p className="text-lg leading-relaxed font-medium text-white/80">
              {'\u201C'}Build knowledge. Not chaos.{'\u201D'}
            </p>
            <p className="mt-3 text-sm text-white/40">
              Structured reasoning for teams that ship.
            </p>
          </blockquote>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo className="text-2xl" />
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
