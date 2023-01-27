'use client';

import { type FC, ReactNode } from 'react';

export const AnimatedPing: FC<{ off?: boolean; color?: 'violet' | 'red'; children: ReactNode }> = ({
  children,
  color = 'violet',
  off
}) => {
  return (
    <div className="relative">
      {children}
      {!off && (
        <div className="absolute inset-y-0 left-0 -ml-2 flex items-center">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-600 backdrop-opacity-30" />
            <span className={`bg- relative inline-flex h-2 w-2 rounded-full${color}-500`} />
          </span>
        </div>
      )}
    </div>
  );
};
