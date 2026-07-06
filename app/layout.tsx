import type { Metadata } from 'next';
import {
  Geist,
  Geist_Mono,
  Playfair_Display,
  DM_Sans,
  DM_Serif_Display,
  Space_Grotesk,
  Inter,
} from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
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
const _spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: false,
});
const _inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://syntheonhub.com'),
  title: {
    default: 'Syntheon Hub — Turn meetings into tickets, automatically',
    template: '%s | Syntheon Hub',
  },
  description:
    'Syntheon Hub joins your meetings, extracts action items, and creates organized tickets automatically. AI-powered project management that works while you talk.',
  keywords: [
    'meeting notes',
    'ticket management',
    'project management',
    'AI meeting assistant',
    'automatic ticket creation',
    'sprint planning',
    'kanban board',
    'team productivity',
  ],
  authors: [{ name: 'Syntheon Hub' }],
  creator: 'Syntheon Hub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://syntheonhub.com',
    siteName: 'Syntheon Hub',
    title: 'Syntheon Hub — Turn meetings into tickets, automatically',
    description:
      'Syntheon Hub joins your meetings, extracts action items, and creates organized tickets automatically. AI-powered project management that works while you talk.',
    images: [
      {
        url: '/syntheon-logo.png',
        width: 1200,
        height: 630,
        alt: 'Syntheon Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Syntheon Hub — Turn meetings into tickets, automatically',
    description:
      'AI-powered project management that joins your meetings and creates tickets automatically.',
    images: ['/syntheon-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
      { url: '/syntheon-logo-light.png', media: '(prefers-color-scheme: light)', sizes: '512x512' },
      { url: '/syntheon-logo-dark.png', media: '(prefers-color-scheme: dark)', sizes: '512x512' },
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${_inter.variable} ${_spaceGrotesk.variable} ${_playfair.variable} ${_dmSans.variable} ${_dmSerif.variable}`}
    >
      <head>
        {/* Preconnect to critical third-party domains */}
        <link rel="preconnect" href="https://clerk.accounts.dev" />
        <link rel="dns-prefetch" href="https://clerk.accounts.dev" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ClerkProvider
          appearance={{ theme: shadcn }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          taskUrls={{ 'choose-organization': '/onboarding' }}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
