import { Card } from '@components/UI/Card';
import { type FC } from 'react';

const Shimmer = () => {
  return (
    <Card className="flex w-full justify-between p-5">
      <div className="flex h-24 space-x-10 overflow-hidden">
        <div className="h-24 w-32 border">
          <div className="shimmer h-24 w-32" />
        </div>
        <div className="flex-col space-y-3">
          <div className="shimmer h-3 w-80 rounded-lg" />
          <div className="shimmer h-3 w-64 rounded-lg" />
          <div className="shimmer h-3 w-80 rounded-lg" />
          <div className="shimmer h-3 w-64 rounded-lg" />
        </div>
      </div>
      <div className="shimmer h-10 w-10 rounded-full" />
    </Card>
  );
};

const MissionShimmer: FC<{ times?: number }> = ({ times = 1 }) => {
  return (
    <div className="flex-col space-y-3">
      {Array(times).map((_, index) => (
        <Shimmer key={index} />
      ))}
    </div>
  );
};

export default MissionShimmer;
