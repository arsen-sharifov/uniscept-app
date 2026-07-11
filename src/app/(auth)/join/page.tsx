'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getSession, setSession } from '@api/client';

import { SignUpFlow } from '../fragments';

const JoinPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const resolveInvitedSession = async () => {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');

      if (accessToken && refreshToken) {
        await setSession(accessToken, refreshToken).catch(() => undefined);
        window.history.replaceState(null, '', window.location.pathname);
      }

      const { data } = await getSession();
      const invitedEmail = data.session?.user?.email;

      if (invitedEmail) {
        setEmail(invitedEmail);
      } else {
        router.replace('/login');
      }
    };

    resolveInvitedSession().catch(() => router.replace('/login'));
  }, [router]);

  if (!email) return null;

  return <SignUpFlow mode="invite" lockedEmail={email} />;
};

export default JoinPage;
