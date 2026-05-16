'use client';

import type { ButtonHTMLAttributes } from 'react';

export type TSettingsPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const SettingsPrimaryButton = ({ type = 'button', ...rest }: TSettingsPrimaryButtonProps) => (
  <button
    type={type}
    {...rest}
    className="cursor-pointer rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-2)] px-5 py-2 text-sm font-medium text-[color:var(--on-accent)] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
  />
);
