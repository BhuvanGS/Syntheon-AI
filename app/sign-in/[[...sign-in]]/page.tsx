import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#faf8f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '2rem',
          }}
        >
          <img
            src="/logo.png"
            alt="Syntheon"
            style={{ width: '36px', height: '36px', objectFit: 'contain' }}
          />
          <span
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '1.5rem',
              color: '#3d5a3e',
            }}
          >
            Syntheon
          </span>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
