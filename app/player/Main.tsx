'use client';

import { useAppContext } from '@components/AppContext';
import { type TAddress, useProfileByAddress } from '@hooks/useProfileMissionQuery';
import Custom404 from '@pages/404';
import { type FC } from 'react';
import { useAccount } from 'wagmi';

import Loader from '../UI/Loader';
import MissionListing from './MissionListing';

const URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

const PlayerMain: FC = () => {
  const { user, isAuthenticating } = useAppContext();
  const { address } = useAccount();
  const { profile } = useProfileByAddress(address as TAddress, !address);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <div className="flex items-baseline space-x-5">
        <h1 className="page-top-header">Player</h1>
        {profile?.handle && (
          <div>
            <a
              href={`${URL}/a/${profile.handle}`}
              className="link-text text-sm"
              target="_blank"
              rel="noreferrer"
            >
              Public View
            </a>
          </div>
        )}
      </div>
      <div className="space-y-6">
        <MissionListing />
      </div>
    </>
  );
};

export default PlayerMain;
