'use client';

import { type FC } from 'react';

import { type ParsedEvent, useContractEvents } from '@/hooks/useContractEvents';
import { useMissionByIds } from '@/hooks/useProfileMissionQuery';
import { LinkTextButton } from '@/UI/Button';
import { NoFeedFound } from '@/UI/EmptyState';
import Loader from '@/UI/Loader';
import { OOPS } from '@/utils/constants';

import SingleTMissionCard from './SingleTMissionCard';

const TimelinedEvents: FC<{
  kind: 'Started' | 'Completed';
  isVerifier: boolean;
  isCreatorPage: boolean;
}> = ({ kind, isVerifier, isCreatorPage }) => {
  const { contractEvents, error: contractEventsError, isLoading } = useContractEvents(kind);
  const {
    missions,
    isFetching,
    refetch,
    error: missionByIdsError
  } = useMissionByIds(
    contractEvents as ParsedEvent[],
    !(contractEvents?.length && contractEvents.length > 0)
  );

  return (
    <div className="mb-10 space-y-6 md:mb-20">
      <div className="flex items-end space-x-5">
        <h2 className="page-section-title px-2 md:px-0">Latest</h2>
        <LinkTextButton
          text={<div className="text-sm">Refresh</div>}
          handleClick={() => refetch()}
        />
      </div>
      <div className="flex-col space-y-2">
        {isFetching || isLoading ? (
          <Loader className="h-[400px] md:h-[800-px]" />
        ) : (
          <>
            {missions && Array(missions) && missions.length > 0 ? (
              <>
                {missions.map((m) => (
                  <>
                    {m && (
                      <SingleTMissionCard
                        key={m.challengeHash}
                        mission={m}
                        isVerifier={isVerifier}
                        isCreatorPage={isCreatorPage}
                      />
                    )}
                  </>
                ))}
              </>
            ) : (
              <NoFeedFound title="No more data" animate={false} />
            )}
          </>
        )}
        {(contractEventsError || missionByIdsError) && <div>{OOPS}</div>}
      </div>
    </div>
  );
};

export default TimelinedEvents;
