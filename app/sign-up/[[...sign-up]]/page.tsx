import { SignUp } from '@clerk/nextjs';
import { BetaOverMessage } from '@/components/beta-over-message';
import { AuthShell } from '@/components/auth/auth-shell';
import { isAppClosed } from '@/lib/beta';

export default function SignUpPage() {
  if (isAppClosed()) {
    return <BetaOverMessage />;
  }

  return (
    <AuthShell mode="sign-up">
      <SignUp />
    </AuthShell>
  );
}
