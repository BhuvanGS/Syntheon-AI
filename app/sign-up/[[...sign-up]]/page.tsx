import { SignUp } from '@clerk/nextjs';
import { PreAuthConsent } from '@/components/pre-auth-consent';
import { BetaOverMessage } from '@/components/beta-over-message';
import { isBetaExpired } from '@/lib/beta';

export default function SignUpPage() {
  if (isBetaExpired()) {
    return <BetaOverMessage />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side — branding */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-center px-12 lg:px-20"
        style={{
          backgroundColor: '#0a0a0a',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      >
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-12">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: '#fff' }}
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#000',
                }}
              >
                S
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '-0.02em',
              }}
            >
              Syntheon Hub
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
            }}
          >
            Turn your meetings into shipped work
          </h1>

          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.6,
              marginTop: '1.5rem',
              maxWidth: '420px',
            }}
          >
            Syntheon Hub captures your conversations, extracts the important stuff, and turns it
            into tickets, specs, and action items — automatically.
          </p>

          <p
            className="font-[family-name:var(--font-space-grotesk)]"
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.35)',
              marginTop: '1rem',
              fontStyle: 'italic',
            }}
          >
            — Team SyntheonHub
          </p>

          <div className="mt-12 flex items-center gap-6">
            {['Meetings → Tickets', 'AI-powered', 'Real-time sync'].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}
                />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — consent + auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-auto">
        <div className="w-full max-w-3xl">
          <PreAuthConsent>
            <SignUp />
          </PreAuthConsent>
        </div>
      </div>
    </div>
  );
}
