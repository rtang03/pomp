import type { FC, ReactNode } from 'react';

import TopNavMenu from '@/Shared/TopNavMenu';

const VerifierLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="py-10">
    <TopNavMenu
      tabs={[
        { path: '/', title: 'Explore' },
        { path: '/verifier', title: 'Verifier' },
        { path: '/verifier/tool', title: 'Tool' }
      ]}
    />
    <div>{children}</div>
  </div>
);

export default VerifierLayout;
