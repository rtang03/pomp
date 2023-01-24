'use client';

import Custom404 from '@pages/404';
import { type FC, useState } from 'react';

import useAppContext from '@/Shared/AppContext';
import TimelinedEvents from '@/Shared/TimelinedEvents';
import Loader from '@/UI/Loader';
import TabGroup from '@/UI/TabGroup';

import SearchByChallenge from './SearchByChallenge';

const VerifierMain: FC = () => {
  const { user, isAuthenticating } = useAppContext();
  const [selectedTab, setSelectedTab] = useState<number>(0);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      <div className="flex border-b-2">
        <TabGroup
          titles={['Search', 'Latest']}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </div>
      {selectedTab === 0 && <SearchByChallenge />}
      {selectedTab === 1 && <TimelinedEvents kind="Completed" isCreatorPage={false} isVerifier />}
    </>
  );
};

export default VerifierMain;
