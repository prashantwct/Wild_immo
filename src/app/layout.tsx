import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { Toaster } from '@/components/toaster';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export const metadata: Metadata = {
  title: 'Wildlife Immobilization Tracker',
  description: 'Track and manage wildlife immobilization events',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Wildlife Immobilization Tracker',
    description: 'Track and manage wildlife immobilization events',
    url: '/',
    siteName: 'Wildlife Tracker',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Wildlife Tracker',
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">
              <div className="container py-8">
                {children}
              </div>
            </main>
            <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex flex-col items-center justify-between gap-4 py-6 md:h-24 md:flex-row">
                <p className="text-sm text-muted-foreground">
                  {new Date().getFullYear()} Wildlife Immobilization Tracker. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
