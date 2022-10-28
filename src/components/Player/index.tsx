import { useAppContext } from '@components/AppContext';
import { PlayerNavMenu } from '@components/Shared/Navbar/TopNavMenu';
import Loader from '@components/UI/Loader';
import { useProfileByAddress } from '@hooks/useProfileMissionQuery';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { useAccount } from 'wagmi';

// need to CSR, coz of React-query cache
const Listing = dynamic(() => import('./MissionListing'), { ssr: false });
const URL = process.env.NEXT_PUBLIC_URL_DOMAIN || 'http://localhost:3000';

const PlayerPage: NextPageWithLayout = () => {
  const { user, isAuthenticating } = useAppContext();
  const { address } = useAccount();
  const { profile } = useProfileByAddress(address as string, !address);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <PlayerNavMenu />
      <div className="page-layout">
        <div className="container items-center justify-start">
          <div className="page-main">
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
              {/* Todo: Suspense does not seem to work. Debug later*/}
              <Suspense fallback={<Loader />}>
                <Listing />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

PlayerPage.getLayout = (page) => <>{page}</>;

export default PlayerPage;
