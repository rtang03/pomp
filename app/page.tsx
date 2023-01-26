import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { isMissionDocuments } from '@/types/MissionDocument';
import { getFirebase } from '@/utils/firebase';

import HomeMain from './home/Main';

export const revalidate = 60;

const getData = cache(async () => {
  const { db } = await getFirebase();
  const q = query(
    collection(db, 'mission'),
    orderBy('updatedAt', 'desc'),
    limit(5),
    where('status', '==', 'Published')
  );

  const snapshot = await getDocs(q);
  const data: unknown[] = snapshot.docs.map((d) => d.data());
  if (data.length > 0) {
    if (isMissionDocuments(data)) return data;
    else return null;
  } else return [];
});

const IndexPage = async () => {
  const data = await getData();
  data === null && notFound();

  return (
    <div className="page-layout">
      <HomeMain stringifiedData={JSON.stringify(data)} />
    </div>
  );
};

export default IndexPage;
