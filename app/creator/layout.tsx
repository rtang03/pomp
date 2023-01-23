import type { FC, ReactNode } from 'react';

import TopNavMenu from '@/Shared/TopNavMenu';

const CreatorLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="py-10">
    <TopNavMenu
      tabs={[
        { path: '/', title: 'Explore' },
        { path: '/creator/timeline/explore', title: 'Timeline' },
        { path: '/creator', title: 'Compose' }
      ]}
    />
    <div>{children}</div>
  </div>
);

export default CreatorLayout;
