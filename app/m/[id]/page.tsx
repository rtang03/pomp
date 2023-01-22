import { getApps } from '@firebase/app';
import { createFirebaseApp, initApp } from '@utils/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';

import Main from './Main';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

export const generateStaticParams = async () => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth || !EMAIL || !PASSWORD)
    return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const user = await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD);
  if (!user) return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const querySnapshot = await getDocs(collection(app.db, 'mission'));
  return querySnapshot.docs.map(({ id }) => ({ id }));
};

const MissionPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  !id && notFound();

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
  const stringifiedData = JSON.stringify(snapshot.data());

  console.log('server: ', stringifiedData);
  return (
    <>
      <Main stringifiedData={stringifiedData} />
    </>
  );
};

export default MissionPage;
