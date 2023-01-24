import { type Analytics, getAnalytics } from '@firebase/analytics';
import { type FirebaseApp, getApps, initializeApp } from '@firebase/app';
import { type Auth, getAuth } from '@firebase/auth';
import { type Firestore, getFirestore } from '@firebase/firestore';
import { type Functions, getFunctions } from '@firebase/functions';

// https://firebase.google.com/docs/functions/callable#web-version-9_1

export type FirebaseService = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  functions: Functions;
  analytics: Analytics | undefined;
};

export const createFirebaseApp: () => FirebaseService | null = () => {
  const clientCredentials = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID
  };

  if (getApps().length === 0) {
    const app = initializeApp(clientCredentials);
    // Check that `window` is in scope for the analytics module!
    // Enable analytics. https://firebase.google.com/docs/analytics/get-started
    const analytics = typeof window !== 'undefined' ? getAnalytics(app) : undefined;
    const functions = getFunctions(app);
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, functions, auth, db, analytics };
  }
  return null;
};

export const initApp = (_app: FirebaseApp) => ({
  auth: getAuth(_app),
  db: getFirestore(_app),
  analytics: typeof window !== 'undefined' ? getAnalytics(_app) : undefined
});
