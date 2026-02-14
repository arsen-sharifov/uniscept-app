import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Uniscept',
  description: 'A platform for structured discussions and argument mapping',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
