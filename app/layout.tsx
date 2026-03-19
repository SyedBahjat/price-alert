import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PriceAlert — Real-Time Price Alerts',
  description: 'Set price targets for crypto and stocks. Get notified via Email, Telegram and Discord when they hit.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'PriceAlert — Real-Time Price Alerts',
    description: 'Set price targets for crypto and stocks. Get notified via Email, Telegram and Discord when they hit.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
