import { AppContext } from '@components/AppContext';
import Navbar from '@components/Shared/Navbar';
import { type User, onAuthStateChanged } from '@firebase/auth';
import { doc, getDoc, setDoc } from '@firebase/firestore';
import { elog } from '@utils/consoleLog';
import { createFirebaseApp, FirebaseService } from '@utils/firebaseClient';
import { getToastOptions } from '@utils/getToastOptions';
import { useTheme } from 'next-themes';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import toaster, { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { supportedChainIds } from 'src/constants';
import type { UserProfile } from 'src/types';
import { useAccount, useNetwork } from 'wagmi';

const SiteLayout: FC<any> = ({ children }) => {
  const [dev, setDev] = useState<boolean>(process.env.NEXT_PUBLIC_MAINNET !== 'true');
  const [app, setApp] = useState<FirebaseService | null>();
  const isMounted = useRef<boolean>(false);
  const { resolvedTheme } = useTheme();
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
    <>
      <AppContext.Provider value={value}>
        <Navbar />
        <>{children}</>
      </AppContext.Provider>
      <Toaster position="bottom-right" toastOptions={toastOptions} />
    </>
  );
};

export default SiteLayout;
