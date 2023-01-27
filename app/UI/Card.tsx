import clsx from 'clsx';
import type { FC, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  rounded?: boolean;
}

export const Card: FC<CardProps> = ({ children, className = '', rounded = false }) => (
  <div
    className={clsx(
      rounded ? 'rounded-xl' : 'rounded-none',
      'border border-gray-900/30 bg-white dark:border-gray-800 dark:bg-gray-900',
      className
    )}
  >
    {children}
  </div>
);

type CardHeaderProps = {
  className?: string;
  title?: string | ReactNode;
  content?: string | ReactNode;
  action?: ReactNode;
  noBottomPadding?: boolean;
};

export const CardHeader: FC<CardHeaderProps> = ({
  noBottomPadding,
  action,
  title,
  content,
  className = ''
}) => (
  <div
    className={`flex justify-between border-b border-gray-500/50 px-3 pt-3 ${
      noBottomPadding ? '' : 'pb-3'
    } ${className}`}
  >
    <div className="flex-col">
      {title && <div className="text-2xl">{title}</div>}
      {content && <div>{content}</div>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardBodyProps {
  children?: ReactNode;
  className?: string;
}

export const CardBody: FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardActions: FC<{
  children?: ReactNode;
  content?: ReactNode | string;
  reset?: () => void;
}> = ({ children, content, reset }) => (
  <div className="block items-center sm:flex">
    <div className="flex items-center space-x-4">
      <div>{content}</div>
    </div>
    <div className="ml-auto flex items-center space-x-2 pt-2 sm:pt-0">{children}</div>
  </div>
);
