import SingleMissionCard from '@components/Home/SingleMissionCard';
import { NoFeedFound } from '@components/UI/EmptyState';
import isEqual from 'lodash/isEqual';
import { type FC, type ReactNode } from 'react';
import type { MissionDocument } from 'src/types';

type Props = {
  missions: MissionDocument[];
  children?: ReactNode;
};

const MissionListing: FC<Props> = ({ missions, children }) => {
  return (
    <div className="space-y-6">
      <h2 className="page-section-title">Mission ({missions?.length})</h2>
      {isEqual(missions, []) ? (
        <NoFeedFound title="No more data" animate={false} />
      ) : (
        <>
          <div className="flex-col space-y-2">
            {missions.map((m) => (
              <SingleMissionCard mission={m} key={m.createdAt} />
            ))}
          </div>
        </>
      )}
      {children}
    </div>
  );
};

export default MissionListing;
