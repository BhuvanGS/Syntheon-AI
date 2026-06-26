import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, DM_Sans, DM_Serif_Display } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ClerkProvider } from '@clerk/nextjs';
import { ToastProvider } from '@/components/island-toast';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const _geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Only preload critical fonts
});
const _playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
});
const _dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: false,
});
const _dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: 'Syntheon — Turns conversations into software',
  description:
    'Syntheon joins your meetings, extracts spec blocks, generates code, opens PRs, creates Linear tickets, and deploys a live preview — automatically.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      taskUrls={{
        'choose-organization': '/onboarding',
      }}
    >
      <html
        lang="en"
        suppressHydrationWarning
        className={`${_playfair.variable} ${_dmSans.variable} ${_dmSerif.variable}`}
      >
        <head>
          {/* Preconnect to critical third-party domains */}
          <link rel="preconnect" href="https://clerk.accounts.dev" />
          <link rel="dns-prefetch" href="https://clerk.accounts.dev" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </head>
        <body className="font-sans antialiased bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              {children}
              <Analytics />
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
