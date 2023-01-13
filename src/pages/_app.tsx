import '../globals.css';

import SiteLayout from '@components/Layout/SiteLayout';
import { Inter } from '@next/font/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type NextPage } from 'next';
import type { AppProps } from 'next/app';
import { DefaultSeo } from 'next-seo';
import SeoConfig from 'next-seo.config';
import { ThemeProvider } from 'next-themes';
import type { ReactElement, ReactNode } from 'react';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export type NextPageWithLayout<Props = any> = NextPage<Props> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

// TODO: Add Polygon and Mainnet later

const IS_LOCALHOST = process.env.NEXT_PUBLIC_IS_LOCALHOST === 'true';

const ALCHEMY_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mumbai'
    ? process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    : process.env.NEXT_PUBLIC_ALCHEMY_GOERLI;

const { chains, provider, webSocketProvider } = configureChains(
  IS_LOCALHOST
    ? [chain.localhost]
    : [
        chain.polygon,
        chain.polygonMumbai,
        chain.mainnet,
        // chain.hardhat,
        chain.goerli
      ],
  IS_LOCALHOST
    ? [
        jsonRpcProvider({
          rpc: (chain) => ({
            http: `http://localhost:8545`
          }),
          priority: 2
        })
      ]
    : [alchemyProvider({ priority: 1, apiKey: ALCHEMY_API_KEY })]
);

const client = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({ chains, options: { qrcode: true } })
  ]
});

const queryClient = new QueryClient();

const App: NextPage<any> = ({ Component, pageProps }) => {
  const getLayout = Component.getLayout ?? ((page: ReactElement) => page);

  return (
    <ThemeProvider attribute="class">
      <WagmiConfig client={client}>
        <QueryClientProvider client={queryClient}>
          <DefaultSeo {...SeoConfig} />
          <main className={`${inter.variable} font-sans`}>
            <SiteLayout>{getLayout(<Component {...pageProps} />)}</SiteLayout>
          </main>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </WagmiConfig>
    </ThemeProvider>
  );
};

export default App;
