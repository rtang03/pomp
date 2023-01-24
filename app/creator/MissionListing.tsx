'use client';

import { type DocumentData, Query } from '@firebase/firestore';
import isEqual from 'lodash/isEqual';
import { type FC, useState } from 'react';

import usePaginatedFirestore from '@/hooks/usePaginatedFirestore';
import MissionShimmer from '@/Shared/Shimmer/MissionShimmer';
import type { MissionDocument } from '@/types/MissionDocument';
import { NoFeedFound } from '@/UI/EmptyState';
import Pagination from '@/UI/Pagination';

import SingleMission from './SingleMission';

type Props = {
  query: Query<DocumentData>;
};

const DEFAULT_PAGE_SIZE = 5;

const MissionListing: FC<Props> = ({ query }) => {
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const {
    items: missions,
    isLoading,
    isStart,
    isEnd,
    getPrev,
    getNext
  } = usePaginatedFirestore<MissionDocument>(query, { limit: pageSize });

  return (
    <>
      {isLoading ? (
        <MissionShimmer times={1} />
      ) : (
        <>
          <div className="space-y-6">
            {isEqual(missions, []) ? (
              <NoFeedFound title="No more data" animate={false} />
            ) : (
              <>
                <div className="flex-col space-y-2">
                  {missions?.map((mission) => (
                    <SingleMission key={mission.createdAt} mission={mission} />
                  ))}
                </div>
              </>
            )}
            {missions && (
              <Pagination
                isStart={isEqual(missions, []) ? true : isStart}
                isEnd={isEqual(missions, []) ? true : isEnd}
                getNext={getNext}
                getPrev={getPrev}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default MissionListing;
