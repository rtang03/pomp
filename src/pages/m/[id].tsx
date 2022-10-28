import PublishedMission from '@components/PublishedMission';
import { getApps } from '@firebase/app';
import { createFirebaseApp, initApp } from '@utils/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { PathProps, SiteProps } from 'src/types';

const EMAIL = process.env.FIREBASE_ADMIN_EMAIL;
const PASSWORD = process.env.FIREBASE_ADMIN_PASSWORD;

export default PublishedMission;

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const _apps = getApps();
  const app = _apps.length > 0 ? initApp(_apps[0]) : createFirebaseApp();

  if (!app?.db || !app?.auth || !EMAIL || !PASSWORD)
    return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const user = await signInWithEmailAndPassword(app.auth, EMAIL, PASSWORD);
  if (!user) return { paths: [{ params: { id: '' } }], fallback: 'blocking' };

  const querySnapshot = await getDocs(collection(app.db, 'mission'));
  const paths = querySnapshot.docs.map(({ id }) => ({ params: { id } }));
  return { paths, fallback: true };
};

export const getStaticProps: GetStaticProps<SiteProps, PathProps> = async ({ params }) => {
  if (!params) throw new Error('No path parameters found');
  const { id } = params;

  // even when same page /m/[id] is hard reload, Firebase app remains. getApps() to retrieve the
  // preexisting app.
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
  return { props: { stringifiedData } };
};
