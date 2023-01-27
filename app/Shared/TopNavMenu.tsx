'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type FC } from 'react';

type Tabs = { tabs: { path: string; title: string }[] };

const TopNavMenu: FC<Tabs> = ({ tabs }) => {
  const pathname = usePathname();

  return (
    <div className="flex justify-center border-gray-500/50">
      <div className="flex items-center justify-between space-x-10 md:space-x-12">
        {tabs.map(({ path, title }, index) => (
          <Link key={`${index}-${title}`} href={path}>
            <div
              className={
                pathname === tabs[index].path
                  ? 'border-b-4 border-black dark:border-white'
                  : 'border-b-4 border-black/50 dark:border-gray-700'
              }
            >
              <motion.button type="button" whileTap={{ scale: 0.95 }}>
                {title}
              </motion.button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopNavMenu;
