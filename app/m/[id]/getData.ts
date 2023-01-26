import 'server-only';

import { doc, getDoc } from 'firebase/firestore';
import { cache } from 'react';

import { getFirebase } from '@/utils/getFirebase';

export const getData = cache(async (id: string) => {
  const { db } = await getFirebase();
  const snapshot = await getDoc(doc(db, 'mission', id as string));
  return snapshot.data();
});
