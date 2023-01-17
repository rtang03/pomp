import './globals.css';

import { Inter } from '@next/font/google';
import { type ReactNode } from 'react';

import NavBar from './NavBar';
import SiteLayout from './SiteLayout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const nav: ReactNode = (
  <>
    <NavBar />
    <div className="flex justify-center border-b border-gray-500/50"></div>
  </>
);
const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <head>
        <title></title>
      </head>
      <body>
        <main className={`${inter.variable} font-sans`}>
          <SiteLayout nav={nav}>{children}</SiteLayout>
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
