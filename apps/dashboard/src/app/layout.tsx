import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import './globals.css';

export const metadata: Metadata = {
  title: 'GPS Platform',
  description: 'Real-time GPS tracking platform',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
