'use client';

import { addDoc, collection, DocumentReference, orderBy, query, where } from '@firebase/firestore';
import Custom404 from '@pages/404';
import { useRouter } from 'next/navigation';
import { type FC, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import useAppContext from '@/Shared/AppContext';
import NewItem from '@/Shared/NewItem';
import type { MissionDocument } from '@/types/MissionDocument';
import Loader from '@/UI/Loader';
import LoadingDots from '@/UI/LoadingDots';
import SimplePlusButton from '@/UI/SimplePlusButton';
import TabGroup from '@/UI/TabGroup';

import MissionListing from './MissionListing';

const CreatorMain: FC = () => {
  const { firestore, user, isAuthenticating } = useAppContext();
  const { address } = useAccount();
  const router = useRouter();
  const [docRef, setDocRef] = useState<DocumentReference>();
  const [selectedStatus, setSelectedStatus] = useState<number>(0);

  useEffect(() => {
    docRef && router.push(`/edit/${docRef.id}`);
  }, [docRef, router]);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="page-top-header invisible md:visible">Mission</h1>
        {firestore && address && user && (
          <NewItem
            saveToCloud={async () => {
              const now = Date.now();
              const mission: MissionDocument = {
                uid: user.uid,
                wallet: address,
                createdAt: now,
                updatedAt: now,
                status: 'Draft'
              };
              const ref = await addDoc(collection(firestore, 'mission'), mission);
              setDocRef(ref);
            }}
            submitButton={(isSubmitting) => (
              <SimplePlusButton
                formSubmit
                text={isSubmitting ? <LoadingDots /> : <div>Mission</div>}
              />
            )}
          />
        )}
      </div>
      <div className="page-main">
        <div className="space-y-6">
          <h2 className="page-section-title hidden md:block">Compose</h2>
          <div className="flex border-b border-gray-500/50 px-2 md:px-0">
            <TabGroup
              titles={['Draft', 'Published', 'Archived']}
              selectedTab={selectedStatus}
              setSelectedTab={setSelectedStatus}
            />
          </div>
          <div>
            {selectedStatus === 0 && firestore && (
              <MissionListing
                query={query(
                  collection(firestore, 'mission'),
                  where('status', '==', 'Draft'),
                  where('wallet', '==', address),
                  orderBy('createdAt', 'desc')
                )}
              />
            )}
            {selectedStatus === 1 && firestore && (
              <MissionListing
                query={query(
                  collection(firestore, 'mission'),
                  where('status', '==', 'Published'),
                  where('wallet', '==', address),
                  orderBy('createdAt', 'desc')
                )}
              />
            )}
            {selectedStatus === 2 && firestore && (
              <MissionListing
                query={query(
                  collection(firestore, 'mission'),
                  where('status', '==', 'Archived'),
                  where('wallet', '==', address),
                  orderBy('createdAt', 'desc')
                )}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatorMain;
