import './globals.css';

import { Inter } from '@next/font/google';
import Link from 'next/link';
import { ServerThemeProvider } from 'next-themes';
import type { FC, ReactNode } from 'react';

import AccountButtonGroup from './AccountButtonGroup';
import SiteLayout from './SiteLayout';

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
            <SiteLayout
              nav={
                <>
                  <header>
                    <nav className="top-navigation h-20">
                      <div className="flex flex-1 justify-start px-2 md:px-0">
                        <Link href={'/'}>Home</Link>
                      </div>
                      <div className="flex items-center justify-end space-x-5">
                        <AccountButtonGroup />
                      </div>
                    </nav>
                  </header>
                  <div className="flex justify-center border-b border-gray-500/50"></div>
                </>
              }
            >
              {children}
            </SiteLayout>
          </main>
        </body>
      </html>
    </ServerThemeProvider>
  );
};

export default RootLayout;
