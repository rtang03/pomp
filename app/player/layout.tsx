import type { FC, ReactNode } from 'react';

import TopNavMenu from '@/Shared/TopNavMenu';

const PlayerLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="py-10">
    <TopNavMenu
      tabs={[
        { path: '/', title: 'Explore' },
        { path: '/player', title: 'Player' },
        { path: '/player/profile', title: 'Profile' }
      ]}
    />
    <div>{children}</div>
  </div>
);

export default PlayerLayout;
