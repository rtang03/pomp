import { getApps } from '@firebase/app';
import { createFirebaseApp, initApp } from '@utils/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { isMissionDocument } from 'src/types';

import { getData } from './getData';
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
  const data = await getData(id);
  const stringifiedData = JSON.stringify(data);

  !isMissionDocument(data) && notFound();

  return (
    <>
      <Main stringifiedData={stringifiedData} />
    </>
  );
};

export default MissionPage;
