import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { type FC } from 'react';
import { staffs } from 'src/data/staffs';
import { useAccount } from 'wagmi';

type Tabs = { tabs: { path: string; title: string }[] };

export const TopNavMenu: FC<Tabs> = ({ tabs }) => {
  const { pathname } = useRouter();

  return (
    <div className="flex justify-center border-b border-gray-500/50">
      <div className="flex items-center justify-between space-x-10 md:space-x-12">
        {tabs.map(({ path, title }, index) => (
          <Link key={`${index}-${title}`} href={path}>
            <a
              className={
                pathname === tabs[index].path ? 'border-b-4 border-black dark:border-white' : ''
              }
            >
              <motion.button type="button" whileTap={{ scale: 0.95 }}>
                {title}
              </motion.button>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
};

export const PlayerNavMenu = () => {
  const { address } = useAccount();
  const isStaff = address ? staffs.includes(address) : false;
  const tabs = [
    { path: '/', title: 'Explore' },
    { path: '/player', title: 'Player' },
    { path: '/player/profile', title: 'Profile' }
  ];
  isStaff && tabs.push({ path: '/player/admin', title: 'Admin' });
  return <TopNavMenu tabs={tabs} />;
};

export const CreatorNavMenu = () => (
  <TopNavMenu
    tabs={[
      { path: '/', title: 'Explore' },
      { path: '/creator/timeline/explore', title: 'Timeline' },
      { path: '/creator', title: 'Compose' }
    ]}
  />
);

export const VerifierNavMenu = () => (
  <TopNavMenu
    tabs={[
      { path: '/', title: 'Explore' },
      { path: '/verifier', title: 'Verifier' },
      { path: '/verifier/tool', title: 'Tool' }
    ]}
  />
);
