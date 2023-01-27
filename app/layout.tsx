import './globals.css';

import { Inter } from '@next/font/google';
import { ServerThemeProvider } from 'next-themes';
import type { FC, ReactNode } from 'react';

import AppProviders from './AppProviders';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ServerThemeProvider attribute="class">
      <html lang="en">
        <head>
          <title></title>
        </head>
        <body>
          <main className={`${inter.variable} font-sans`}>
            <AppProviders>{children}</AppProviders>
          </main>
        </body>
      </html>
    </ServerThemeProvider>
  );
};

export default RootLayout;
