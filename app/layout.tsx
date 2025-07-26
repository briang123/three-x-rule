import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '3x Rule Chat Assistant',
  description: 'AI-powered chat assistant that implements the 3x Rule for refined responses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
