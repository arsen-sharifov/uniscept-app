'use client';

import type { InputHTMLAttributes } from 'react';

export type TSettingsInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SettingsInput = (props: TSettingsInputProps) => (
  <input
    {...props}
    className="w-full rounded-xl border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm text-[color:var(--text-strong)] transition-colors focus:border-[color:var(--accent)] focus:outline-none"
  />
);
