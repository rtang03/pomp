import { Card, CardBody } from '@components/UI/Card';
import { type FC } from 'react';

const PostShimmer: FC = () => {
  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex justify-between">
          <div className="shimmer h-3 w-20 rounded-lg" />
        </div>
      </CardBody>
      <div className="flex gap-7 border-t py-3 px-5 dark:border-gray-800">
        <div className="shimmer h-5 w-5 rounded-lg" />
        <div className="shimmer h-5 w-5 rounded-lg" />
        <div className="shimmer h-5 w-5 rounded-lg" />
        <div className="shimmer h-5 w-5 rounded-lg" />
      </div>
    </Card>
  );
};

export default PostShimmer;
