import type { Metadata, Viewport } from 'next';
import { Space_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const spaceMono = Space_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'N1X.sh - NEURAL UPLINK ACTIVE',
  description:
    '>> TRANSMISSION RECEIVED. Access TUNNELCORE streams: [AUGMENTED] cyborg sovereignty protocol, cinematic neural fractures, GIGERCORE signal.',
  openGraph: {
    title: 'N1X.sh - NEURAL UPLINK ACTIVE',
    description:
      '>> TRANSMISSION RECEIVED. Access TUNNELCORE streams: [AUGMENTED] cyborg sovereignty protocol, cinematic neural fractures, GIGERCORE signal.',
    type: 'website',
    siteName: 'N1X.sh',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={spaceMono.className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#000',
        }}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
