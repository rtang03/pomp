import Pagination from '@components/UI/Pagination';
import { collection, Firestore, orderBy, query, where } from '@firebase/firestore';
import { usePaginatedFirestore } from '@hooks/usePaginatedFirestore';
import isEqual from 'lodash/isEqual';
import { type FC, useState } from 'react';
import type { MissionDocument } from 'src/types';

import MissionListing from './MissionListing';

type Props = {
  firestore: Firestore;
};

const DEFAULT_PAGE_SIZE = 5;

const ShowMore: FC<Props> = ({ firestore }) => {
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const q = query(
    collection(firestore, 'mission'),
    orderBy('updatedAt', 'desc'),
    where('status', '==', 'Published')
  );
  const {
    items: missions,
    isLoading,
    isStart,
    isEnd,
    getPrev,
    getNext
  } = usePaginatedFirestore<MissionDocument>(q, { limit: pageSize });

  return (
    <>
      <div className="flex items-baseline space-x-5">
        <h1 id="setting" className="page-top-header">
          Latest
        </h1>
      </div>
      <MissionListing missions={missions}>
        {missions && (
          <Pagination
            isStart={isEqual(missions, []) ? true : isStart}
            isEnd={isEqual(missions, []) ? true : isEnd}
            getNext={getNext}
            getPrev={getPrev}
          />
        )}
      </MissionListing>
    </>
  );
};

export default ShowMore;
