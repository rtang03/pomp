import { collection, getDocs } from 'firebase/firestore';
import { notFound } from 'next/navigation';

import { isMissionDocument } from '@/types/MissionDocument';
import type { GenerateStaticParams } from '@/types/next';
import { getFirebase } from '@/utils/firebase';

import { getData } from './getData';
import Main from './Main';

export const dynamicParams = true;
export const revalidate = 60;

export const generateStaticParams: GenerateStaticParams<{ id: string }> = async () => {
  const { db } = await getFirebase();
  const querySnapshot = await getDocs(collection(db, 'mission'));
  const result: { id: string }[] = [];

  querySnapshot.docs.forEach(({ id }) => result.push({ id }));

  return result;
};

// @ts-expect-error Server Component
async function MissionPage(props) {
  const { params } = props;
  const id = params?.id;

  if (!id) return null;

  const data = await getData(id);
  const stringifiedData = JSON.stringify(data);

  !isMissionDocument(data) && notFound();

  return <Main stringifiedData={stringifiedData} />;
}

export default MissionPage;
