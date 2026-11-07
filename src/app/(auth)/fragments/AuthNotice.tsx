import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import type { TAuthNoticeTone } from '@interfaces';

import { AUTH_NOTICE_ROLES, AUTH_NOTICE_TONE_CLASSES } from '../consts';

interface IAuthNoticeProps {
  tone: TAuthNoticeTone;
  className?: string;
  children: ReactNode;
}

export const AuthNotice = ({ tone, className, children }: IAuthNoticeProps) => (
  <div
    role={AUTH_NOTICE_ROLES[tone]}
    className={clsx(
      'rounded-lg border px-4 py-3 text-center font-grotesk text-sm',
      AUTH_NOTICE_TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </div>
);
