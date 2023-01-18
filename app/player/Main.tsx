'use client';

import { useAppContext } from '@components/AppContext';
import { TAddress, useProfileByAddress } from '@hooks/useProfileMissionQuery';
import Custom404 from '@pages/404';
import { type FC } from 'react';
import { useAccount } from 'wagmi';

import Loader from '../UI/Loader';

const URL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

const PlayerMain: FC = () => {
  const { user, isAuthenticating } = useAppContext();
  const { address } = useAccount();
  const { profile } = useProfileByAddress(address as TAddress, !address);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return <></>;
};

export default PlayerMain;
