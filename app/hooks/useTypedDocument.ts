'use client';

import { doc, DocumentReference, FirestoreError } from '@firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';

import useAppContext from '@/Shared/AppContext';

const useTypedDocument: <TDocument = any>(
  path: string,
  id: string | string[] | undefined
) => { value: TDocument | undefined; loading: boolean; error: FirestoreError | undefined } = <
  TDocument
>(
  path: string,
  id: string | string[] | undefined
) => {
  const { firestore, user } = useAppContext();
  const [value, loading, error] = useDocumentData<TDocument>(
    firestore && user
      ? (doc?.(firestore, path, id as string) as DocumentReference<TDocument>)
      : undefined,
    { snapshotListenOptions: { includeMetadataChanges: true } }
  );
  return { value, loading, error };
};

export default useTypedDocument;
