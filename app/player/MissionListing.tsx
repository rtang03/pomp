'use client';

import { motion } from 'framer-motion';
import { type FC } from 'react';

import useMissionsByAddress from '@/hooks/useMissionsByAddress';
import SingleTMissionCard from '@/Shared/SingleTMissionCard';
import { LinkTextButton } from '@/UI/Button';
import { NoFeedFound } from '@/UI/EmptyState';
import Loader from '@/UI/Loader';

const MissionListing: FC = () => {
  const {
    isErrorProfileByAddress,
    isLoading,
    allPages,
    refetch,
    hasNextPage,
    fetchNextPage,
    isVerifier
  } = useMissionsByAddress();

  return (
    <>
      {isErrorProfileByAddress && <div>Fail to fetch profile</div>}
      {isLoading ? (
        <Loader className="h-[800-px]" />
      ) : (
        <>
          <div className="flex items-end space-x-5">
            <h2 className="page-section-title">Timeline ({allPages?.length || 0})</h2>
            <LinkTextButton
              text={<div className="text-sm">Refresh</div>}
              handleClick={() => refetch()}
            />
          </div>
          {allPages && allPages.length > 0 ? (
            <>
              <div className="flex-col space-y-2">
                {allPages.map((m, index) => (
                  <div key={`mlist-${index}`}>
                    {m && (
                      <SingleTMissionCard
                        key={`player-m-${m.tokenId}`}
                        mission={m}
                        refetch={refetch}
                        isVerifier={!!isVerifier}
                        isCreatorPage={false}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  disabled={!hasNextPage}
                  className={hasNextPage ? '' : 'opacity-60'}
                  onClick={async () => fetchNextPage()}
                >
                  {hasNextPage ? 'Load More' : 'End of list'}
                </motion.button>
              </div>
            </>
          ) : (
            <NoFeedFound title="No data returned" animate={false} />
          )}
        </>
      )}
    </>
  );
};

export default MissionListing;
