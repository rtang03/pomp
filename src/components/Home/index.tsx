import { useAppContext } from '@components/AppContext';
import BigSquareBox from '@components/UI/BigSquareBox';
import { useCanClaim } from '@hooks/useCanClaim';
import { useProfileByAddress } from '@hooks/useProfileMissionQuery';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';
import { elog } from '@utils/consoleLog';
import Link from 'next/link';
import { useState } from 'react';
import type { SiteProps } from 'src/types';
import { isMissionDocuments } from 'src/types/MissionDocument';
import { useAccount } from 'wagmi';

import Explore from './Explore';

const Home: NextPageWithLayout<SiteProps> = ({ stringifiedData }) => {
  const { isAuthenticated } = useAppContext();
  const { address } = useAccount();
  const { isCreator, isVerifier } = useProfileByAddress(address, !address || !isAuthenticated);
  const [showMore, setShowMore] = useState<boolean>(false);

  let m: unknown;
  try {
    m = JSON.parse(stringifiedData);
  } catch (error) {
    elog('[Home]', error);
  }

  const { isRoothashOutOfSync, canClaim, notWhitelistProfile } = useCanClaim();

  if (isMissionDocuments(m)) {
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
        <Explore missions={m} showMore={showMore} setShowMore={setShowMore} />
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
  }

  return <Custom404 />;
};

Home.getLayout = (page) => <>{page}</>;

export default Home;
