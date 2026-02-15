import type { ReactNode } from 'react';
import Image from 'next/image';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata = {
  title: 'Dallas AI Direct Alpha',
  description: 'Live demo shell for Dallas AI Direct Alpha'
};

function EnvironmentBanner() {
  return (
    <div className="envBanner" role="status" aria-label="environment banner">
      <span>ALPHA DEMO</span>
      <span>ENV: STAGE</span>
      <span>PUBLIC VIEW SAFE</span>
    </div>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <EnvironmentBanner />
        <header className="header">
          <div className="brandLockup">
            <Image
              src="/brand/dallas-ai-logo-color.png"
              alt="Dallas AI"
              width={148}
              height={40}
              priority
              className="brandLogo"
            />
          </div>
          <h1>Dallas AI Direct Alpha</h1>
          <p>Fast, private attendee signal for in-room demo moments.</p>
        </header>
        <main className="main">{children}</main>
        <footer className="footer">Email stays private and is never displayed publicly on the room board.</footer>
      </body>
    </html>
  );
}
