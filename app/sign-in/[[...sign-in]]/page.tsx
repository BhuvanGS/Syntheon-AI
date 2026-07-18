import { SignIn } from '@clerk/nextjs';
import { BetaOverMessage } from '@/components/beta-over-message';
import { AuthShell } from '@/components/auth/auth-shell';
import { isBetaExpired } from '@/lib/beta';

export default function SignInPage() {
  if (isBetaExpired()) {
    return <BetaOverMessage />;
  }

  return (
    <AuthShell mode="sign-in">
      <SignIn />
    </AuthShell>
  );
}
