import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';

import './globals.css';
import Providers from '@/components/providers';

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const VERCEL_BASE_URL = isProduction
  ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
  : 'https://' + process.env.VERCEL_URL;
const METADATA_BASE_URL = isVercel
  ? VERCEL_BASE_URL
  : process.env.NEXT_PUBLIC_BASE_URL;

const rubik = Rubik({
  variable: '--font-rubik',
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  description: 'A Discord bot for looking up PC game deals via IsThereAnyDeal.',
  metadataBase: METADATA_BASE_URL,
  title: {
    template: 'Dealbot | %s',
    default: 'Dealbot',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${rubik.className} max-w-[800px] mx-auto px-edge-gap text-base bg-background text-foreground isolate antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
