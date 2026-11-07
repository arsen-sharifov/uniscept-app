import { cookies } from 'next/headers';

import { PASSWORD_RESET_REQUEST_COOKIE } from '@constants';
import { readPasswordResetCookie, toPendingPasswordReset } from '@/lib/utils';

import { ForgotPasswordFlow } from '../fragments';

const ForgotPasswordPage = async () => {
  const cookieStore = await cookies();
  const pendingRequest = toPendingPasswordReset(
    readPasswordResetCookie(cookieStore.get(PASSWORD_RESET_REQUEST_COOKIE)?.value),
  );

  return <ForgotPasswordFlow pendingRequest={pendingRequest} />;
};

export default ForgotPasswordPage;
