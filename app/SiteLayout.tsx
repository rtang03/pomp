'use client';

import { AppContext } from '@components/AppContext';
import { onAuthStateChanged, User } from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createFirebaseApp, FirebaseService } from '@utils/firebaseClient';
import { ThemeProvider, useTheme } from 'next-themes';
import { type FC, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import toaster, { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { chain, configureChains, createClient, useAccount, useNetwork, WagmiConfig } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

import { UserProfile } from '@/types/UserProfile';
import { elog } from '@/utils/consoleLog';
import { supportedChainIds } from '@/utils/constants';

// see https://github.com/pacocoursey/next-themes/issues/152

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

const getToastOptions = (resolvedTheme: any) => ({
  style: {
    background: resolvedTheme === 'dark' ? '#18181B' : '',
    color: resolvedTheme === 'dark' ? '#fff' : ''
  },
  success: {
    className: 'border border-green-500',
    iconTheme: {
      primary: '#10B981',
      secondary: 'white'
    }
  },
  error: {
    className: 'border border-red-500',
    iconTheme: {
      primary: '#EF4444',
      secondary: 'white'
    }
  },
  loading: { className: 'border border-gray-300' }
});

const SiteLayout: FC<{ nav: ReactNode; children: ReactNode }> = ({ nav, children }) => {
  const [dev, setDev] = useState<boolean>(process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production');
  const [app, setApp] = useState<FirebaseService | null>();
  const isMounted = useRef<boolean>(false);
  const { resolvedTheme, theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isValidWalletAccount, setIsValidWalletAccount] = useState<boolean | null>(null);
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  useEffect(() => {
    chain?.id &&
      user?.displayName &&
      setIsValidWalletAccount(supportedChainIds.includes(chain.id) && user.displayName === address);
  }, [address, chain?.id, user?.displayName]);

  useEffect(() => {
    if (!app && !isMounted.current) {
      const _app = createFirebaseApp();
      _app && setApp(_app);
      _app && (isMounted.current = true);
    }
  }, [app]);

  useEffect(() => {
    if (!app?.auth) return;

    const unsubscriber = onAuthStateChanged(
      app.auth,
      (user) => {
        user ? setUser(user) : setUser(null);
        setIsAuthenticated(isConnected && !!address && !!user);
      },
      (error) => {
        elog('[SiteLayout]', error);
        toaster.error('Auth error');
      }
    );
    // Unsubscribe auth listener on unmount
    return () => unsubscriber();
  }, [address, app?.auth, isConnected]);

  const value = useMemo(
    () => ({
      dev,
      setDev,
      firebaseApp: app?.app,
      firebaseFunctions: app?.functions,
      firebaseAuth: app?.auth,
      firestore: app?.db,
      analytics: app?.analytics,
      user,
      setUser,
      isAuthenticated,
      isAuthenticating,
      setIsAuthenticating,
      isValidWalletAccount
    }),
    [
      app?.analytics,
      app?.app,
      app?.auth,
      app?.db,
      app?.functions,
      dev,
      isAuthenticated,
      isAuthenticating,
      isValidWalletAccount,
      user
    ]
  );

  useEffect(() => {
    if (app?.db && user?.uid) {
      const docRef: any = doc(app.db, 'profiles', user.uid);
      getDoc<UserProfile>(docRef)
        .then((result) => {
          if (result.exists()) {
            console.log('Your profile: ', result.data());
          } else
            return setDoc<UserProfile>(docRef, { wallet: user.displayName || '' })
              .then(() => toast.success('Profile created'))
              .catch((error) => {
                elog('[SiteLayout]/setDoc', error);
                toast.error('Fail to set profile');
              });
        })
        .catch((error) => {
          elog('[SiteLayout]/getDoc', error);
          toast.error('Fail to retrieve profile');
        });
    }
  }, [app?.db, user?.displayName, user?.uid]);

  const toastOptions = getToastOptions(resolvedTheme);

  return (
    <ThemeProvider attribute="class" enableSystem={false}>
      <AppContext.Provider value={value}>
        <WagmiConfig client={client}>
          {nav}
          <QueryClientProvider client={queryClient}>
            {children}
            <Toaster position="bottom-right" toastOptions={toastOptions} />
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </WagmiConfig>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default SiteLayout;
