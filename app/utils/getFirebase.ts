import { getApps } from '@firebase/app';
import { type UserCredential, signInWithEmailAndPassword } from 'firebase/auth';

import { createFirebaseApp, initApp } from '@/utils/firebaseClient';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

let user: UserCredential;

export const getFirebase = async () => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth) throw new Error('Firebase not ready');
  if (!EMAIL || !PASSWORD) throw new Error('Invalid email / password');

  user = user || (await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD));

  if (!user) throw new Error(`failed to signInWithEmailAndPassword`);

  return { user, db: app?.db };
};
