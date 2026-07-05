import { SignUp } from '@clerk/nextjs';
import { PreAuthConsent } from '@/components/pre-auth-consent';

export default function SignUpPage() {
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
            Get started with Syntheon Hub
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
            Join your meetings, extract action items, and turn conversations into organized tickets
            — automatically.
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

      {/* Right side — auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <PreAuthConsent>
            <SignUp />
          </PreAuthConsent>
        </div>
      </div>
    </div>
  );
}
