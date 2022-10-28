import type { FC, ReactNode } from 'react';
import { GiDesert } from 'react-icons/gi';

import { Card, CardBody } from './Card';

interface Props {
  message: ReactNode;
  icon: ReactNode;
  hideCard?: boolean;
}

export const EmptyState: FC<Props> = ({ message, icon, hideCard = false }) => {
  return (
    <Card className={hideCard ? 'border-0 !bg-transparent !shadow-none' : ''}>
      <CardBody>
        <div className="grid justify-items-center space-y-2">
          <div>{icon}</div>
          <div>{message}</div>
        </div>
      </CardBody>
    </Card>
  );
};

export const NoFeedFound: FC<{ title?: string | ReactNode; animate?: boolean }> = ({
  title,
  animate = true
}) => (
  <EmptyState
    message={
      <div className={`${animate ? 'animate-pulse opacity-10' : 'opacity-50'} title-brand`}>
        {title || 'No feed found'}
      </div>
    }
    icon={
      <GiDesert
        className={`h-12 w-12  ${
          animate ? 'animate-pulse opacity-10' : 'opacity-50'
        } title-brand scale-x-150`}
      />
    }
  />
);

export const NoItemWithCTA: FC<{ description?: string | ReactNode; CTA: ReactNode }> = ({
  description,
  CTA
}) => {
  return (
    <Card>
      <div className="grid justify-items-center space-y-2">
        <div>{description}</div>
      </div>
    </Card>
  );
};
