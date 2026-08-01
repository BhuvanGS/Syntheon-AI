import { SignIn } from '@clerk/nextjs';
import { BetaOverMessage } from '@/components/beta-over-message';
import { AuthShell } from '@/components/auth/auth-shell';
import { isAppClosed } from '@/lib/beta';

export default function SignInPage() {
  if (isAppClosed()) {
    return <BetaOverMessage />;
  }

  return (
    <AuthShell mode="sign-in">
      <SignIn />
    </AuthShell>
  );
}
