'use client';

import { useAppContext } from '@components/AppContext';
import { collection, Firestore, orderBy, query, where } from '@firebase/firestore';
import { motion } from 'framer-motion';
import isEqual from 'lodash/isEqual';
import Link from 'next/link';
import { type FC, ReactNode, useState } from 'react';
import { useAccount } from 'wagmi';

import useCanClaim from '@/hooks/useCanClaim';
import usePaginatedFirestore from '@/hooks/usePaginatedFirestore';
import { useProfileByAddress } from '@/hooks/useProfileMissionQuery';
import { type MissionDocument } from '@/types/MissionDocument';
import BigSquareBox from '@/UI/BigSquareBox';
import { SmallBackButton } from '@/UI/Button';
import { ModalWithConnectWalletMessage } from '@/UI/ConnectWalletMessage';
import { NoFeedFound } from '@/UI/EmptyState';
import Pagination from '@/UI/Pagination';

import SingleMissionCard from './SingleMissionCard';

const DEFAULT_PAGE_SIZE = 5;

const MissionListing: FC<{ missions: MissionDocument[]; children?: ReactNode }> = ({
  missions,
  children
}) => (
  <div className="space-y-6">
    <h2 className="page-section-title">Mission ({missions?.length})</h2>
    {isEqual(missions, []) ? (
      <NoFeedFound title="No more data" animate={false} />
    ) : (
      <>
        <div className="flex-col space-y-2">
          {missions.map((m) => (
            <SingleMissionCard mission={m} key={m.createdAt} />
          ))}
        </div>
      </>
    )}
    {children}
  </div>
);

const Latest = () => (
  <h1 id="setting" className="page-top-header">
    Latest
  </h1>
);

const ShowMore: FC<{ firestore: Firestore }> = ({ firestore }) => {
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const q = query(
    collection(firestore, 'mission'),
    orderBy('updatedAt', 'desc'),
    where('status', '==', 'Published')
  );
  const {
    items: missions,
    isLoading,
    isStart,
    isEnd,
    getPrev,
    getNext
  } = usePaginatedFirestore<MissionDocument>(q, { limit: pageSize });

  return (
    <>
      <div className="flex items-baseline space-x-5">
        <Latest />
      </div>
      <MissionListing missions={missions}>
        {missions && (
          <Pagination
            isStart={isEqual(missions, []) ? true : isStart}
            isEnd={isEqual(missions, []) ? true : isEnd}
            getNext={getNext}
            getPrev={getPrev}
          />
        )}
      </MissionListing>
    </>
  );
};

const HomeMain: FC<{
  stringifiedData: string;
}> = ({ stringifiedData }) => {
  const missions: MissionDocument[] = JSON.parse(stringifiedData);
  const { isAuthenticated, firestore } = useAppContext();
  const { address } = useAccount();
  const { isRoothashOutOfSync, canClaim, notWhitelistProfile } = useCanClaim();
  const [showMore, setShowMore] = useState<boolean>(false);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState<boolean>(false);
  const { isCreator, isVerifier } = useProfileByAddress(address, !address || !isAuthenticated);

  return (
    <>
      {isAuthenticated && isRoothashOutOfSync && (
        <div className="container items-center justify-start">
          The roothash is out-of-sync. Please contact administrator.
        </div>
      )}
      {isAuthenticated && notWhitelistProfile && (
        <div className="container items-center justify-start">You are non-whitelisted</div>
      )}
      {isAuthenticated && canClaim && (
        <div className="container items-center justify-start">
          You are eligible to{' '}
          <Link href={`/player/profile`}>
            <a className="link-text">claim your profile</a>
          </Link>
        </div>
      )}
      <div className="container items-center justify-start">
        {showMore && <SmallBackButton handleClick={() => setShowMore(false)} />}
        <div className="page-main">
          {showMore && firestore ? (
            <ShowMore firestore={firestore} />
          ) : (
            <>
              <div className="flex items-baseline space-x-5">
                <Latest />
                <div className="text-lg">( 5 )</div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="link-text"
                  onClick={() =>
                    isAuthenticated ? setShowMore(true) : setShowConnectWalletModal(true)
                  }
                >
                  See all
                </motion.button>
              </div>
              <MissionListing missions={missions} />
            </>
          )}
        </div>
      </div>
      <ModalWithConnectWalletMessage
        showConnectWalletMessage
        showModal={showConnectWalletModal}
        setShowModal={setShowConnectWalletModal}
      />
      {isAuthenticated && !showMore && (
        <div className="mb-10 block h-[500px] items-start justify-center space-y-2 font-sans md:flex md:space-y-0 md:space-x-2">
          {isCreator ? (
            <div>
              <Link href={'/creator/timeline/explore'}>
                <BigSquareBox text={<div className="text-xl">Creator</div>} />
              </Link>
            </div>
          ) : (
            <div>
              <BigSquareBox
                disabled
                text={<div className="text-lg opacity-50">Creator (unsupported)</div>}
              />
            </div>
          )}
          {notWhitelistProfile ? (
            <div>
              <BigSquareBox
                disabled
                text={<div className="text-xl">Player (not whitelisted)</div>}
              />
            </div>
          ) : (
            <div>
              <Link href={'/player'}>
                <BigSquareBox text={<div className="text-xl">Player</div>} />
              </Link>
            </div>
          )}

          {isVerifier ? (
            <div>
              <Link href={'/verifier'}>
                <BigSquareBox text={<div className="text-xl">Verifier</div>} />
              </Link>
            </div>
          ) : (
            <div>
              <BigSquareBox
                disabled
                text={<div className="text-lg opacity-50">Verifier (unsupported)</div>}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HomeMain;
