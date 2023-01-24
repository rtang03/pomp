'use client';

import type { Analytics } from '@firebase/analytics';
import type { FirebaseApp } from '@firebase/app';
import type { Auth, User } from '@firebase/auth';
import type { Firestore } from '@firebase/firestore';
import type { Functions } from '@firebase/functions';
import { type Dispatch, createContext, useContext } from 'react';

export type TContext = {
  dev: boolean;
  setDev: Dispatch<boolean>;
  firebaseApp: FirebaseApp | undefined;
  firebaseFunctions: Functions | undefined;
  firebaseAuth: Auth | undefined;
  firestore: Firestore | undefined;
  analytics: Analytics | undefined;
  user: User | null;
  setUser: Dispatch<User | null>;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  setIsAuthenticating: Dispatch<boolean>;
  isValidWalletAccount: boolean | null;
};

export const AppContext = createContext<TContext>({
  dev: true,
  setDev: () => {},
  firebaseApp: undefined,
  firebaseFunctions: undefined,
  firebaseAuth: undefined,
  firestore: undefined,
  analytics: undefined,
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isAuthenticating: false,
  setIsAuthenticating: () => {},
  isValidWalletAccount: false
});

const useAppContext = () => useContext(AppContext);

export default useAppContext;
