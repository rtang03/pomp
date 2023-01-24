import { getApps } from '@firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { createFirebaseApp, initApp } from '@/utils/firebaseClient';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

export const getData = async (id: string) => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth) {
    console.error(new Error('Firebase not ready'));
    throw new Error('Firebase not ready');
  }

  if (!EMAIL || !PASSWORD) throw new Error('Invalid email / password');

  const user = await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD);
  if (!user) throw new Error(`failed to signInWithEmailAndPassword`);

  const snapshot = await getDoc(doc(app.db, 'mission', id as string));
  return snapshot.data();
};
