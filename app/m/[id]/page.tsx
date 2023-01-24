import { getApps } from '@firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';

import { isMissionDocument } from '@/types/MissionDocument';
import type { GenerateStaticParams } from '@/types/next';
import { createFirebaseApp, initApp } from '@/utils/firebaseClient';

import { getData } from './getData';
import Main from './Main';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

/* @ts-expect-error Server Component */
export const generateStaticParams: GenerateStaticParams<{ id: string }> = async () => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth || !EMAIL || !PASSWORD)
    return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const user = await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD);
  if (!user) return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const querySnapshot = await getDocs(collection(app.db, 'mission'));

  const result: { id: string }[] = [];

  querySnapshot.docs.forEach(({ id }) => result.push({ id }));

  return result;
};

/* @ts-expect-error Server Component */
async function MissionPage(props) {
  const { params } = props;
  const id = params?.id;

  if (!id) return null;

  const data = await getData(id);
  const stringifiedData = JSON.stringify(data);

  !isMissionDocument(data) && notFound();

  return (
    <>
      <Main stringifiedData={stringifiedData} />
    </>
  );
}

export default MissionPage;
