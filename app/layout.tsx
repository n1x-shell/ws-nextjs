import type { Metadata } from 'next';
import { VT323 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const vt323 = VT323({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'N1X.sh - NEURAL UPLINK ACTIVE',
  description: '>> TRANSMISSION RECEIVED. Access TUNNELCORE streams: [AUGMENTED] cyborg sovereignty protocol, cinematic neural fractures, GIGERCORE signal. Synthetics compiling. Analogues pending. Hybrids awakening. ENTER? <Y/N>',
  openGraph: {
    title: 'N1X.sh – NEURAL UPLINK ACTIVE',
    description: '>> TRANSMISSION RECEIVED. Access TUNNELCORE streams: [AUGMENTED] cyborg sovereignty protocol, cinematic neural fractures, GIGERCORE signal. Synthetics compiling. Analogues pending. Hybrids awakening. ENTER? <Y/N>',
    type: 'website',
    siteName: 'N1X.sh',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={vt323.className}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
