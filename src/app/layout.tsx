import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'iHYPE — Music ticketing for fans, by fans',
  description: 'Hype artists, buy tickets with zero fees, and earn as a promoter. Beta now open.',
  openGraph: {
    title: 'iHYPE — Music ticketing for fans, by fans',
    description: 'Hype artists, buy tickets with zero fees, and earn as a promoter.',
    url: 'https://ihype.app',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/assets/logo/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#ff5029',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
