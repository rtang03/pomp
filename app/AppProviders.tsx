'use client';

import Link from 'next/link';
import { ThemeProvider } from 'next-themes';
import type { FC, ReactNode } from 'react';
import { WagmiConfig } from 'wagmi';

import { getClient } from '@/utils/getWagmiClient';

import AccountButtonGroup from './AccountButtonGroup';
import SiteLayout from './SiteLayout';

// see https://github.com/pacocoursey/next-themes/issues/152

const AppProviders: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      <WagmiConfig client={getClient()}>
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
      </WagmiConfig>
    </ThemeProvider>
  );
};

export default AppProviders;
