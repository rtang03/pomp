import HomePage from '@components/Home';
import { getApps } from '@firebase/app';
import { createFirebaseApp, initApp } from '@utils/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import type { GetStaticProps } from 'next';
import type { SiteProps } from 'src/types';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

export default HomePage;

export const getStaticProps: GetStaticProps<SiteProps> = async () => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth) throw new Error('Firebase not ready');
  if (!EMAIL || !PASSWORD) throw new Error('Invalid email / password');

  const user = await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD);
  if (!user) throw new Error(`failed to signInWithEmailAndPassword`);

  const q = query(
    collection(app.db, 'mission'),
    orderBy('updatedAt', 'desc'),
    limit(5),
    where('status', '==', 'Published')
  );

  const snapshot = await getDocs(q);
  const stringifiedData = JSON.stringify(snapshot.docs.map((d) => d.data()));
  return { props: { stringifiedData } };
};
