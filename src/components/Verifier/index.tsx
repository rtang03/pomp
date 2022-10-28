import { useAppContext } from '@components/AppContext';
import { VerifierNavMenu } from '@components/Shared/Navbar/TopNavMenu';
import TimelinedEvents from '@components/Shared/TimelinedEvents';
import Loader from '@components/UI/Loader';
import TabGroup from '@components/UI/TabGroup';
import SearchByChallenge from '@components/Verifier/SearchByChallenge';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';
import { useState } from 'react';

const VerifierPage: NextPageWithLayout = () => {
  const { user, isAuthenticating } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<number>(0);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <VerifierNavMenu />
      <div className="page-layout">
        <div className="flex-col items-center justify-between space-y-10 px-2">
          <h1 className="page-top-header">Find Mission</h1>
          <div className="flex border-b-2">
            <TabGroup
              titles={['Search', 'Latest']}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />
          </div>
          {selectedTab === 0 && <SearchByChallenge />}
          {selectedTab === 1 && (
            <TimelinedEvents kind="Completed" isCreatorPage={false} isVerifier />
          )}
        </div>
      </div>
    </>
  );
};

VerifierPage.getLayout = (page) => <>{page}</>;

export default VerifierPage;
