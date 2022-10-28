import { useAppContext } from '@components/AppContext';
import { SmallBackButton } from '@components/UI/Button';
import { ModalWithConnectWalletMessage } from '@components/UI/ConnectWalletMessage';
import { motion } from 'framer-motion';
import { type Dispatch, type FC, useState } from 'react';
import type { MissionDocument } from 'src/types';

import MissionListing from './MissionListing';
import ShowMore from './ShowMore';

type Props = {
  missions: MissionDocument[];
  showMore: boolean;
  setShowMore: Dispatch<boolean>;
};

const Explore: FC<Props> = ({ missions, showMore, setShowMore }) => {
  const [showConnectWalletModal, setShowConnectWalletModal] = useState<boolean>(false);
  const { isAuthenticated, firestore } = useAppContext();

  return (
    <>
      <div className="flex justify-center border-b border-gray-500/50"></div>
      <div className="container items-center justify-start">
        {showMore && <SmallBackButton handleClick={() => setShowMore(false)} />}
        <div className="page-main">
          {showMore && firestore ? (
            <ShowMore firestore={firestore} />
          ) : (
            <>
              <div className="flex items-baseline space-x-5">
                <h1 id="setting" className="page-top-header">
                  Latest
                </h1>
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
    </>
  );
};

export default Explore;
