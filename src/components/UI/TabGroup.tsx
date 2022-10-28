import { motion } from 'framer-motion';
import { type Dispatch, type FC, type ReactNode, Fragment } from 'react';

type Props = {
  titles: string[] | ReactNode[];
  disabledTabs?: boolean[];
  selectedTab: number;
  setSelectedTab: Dispatch<number>;
};

const TabGroup: FC<Props> = ({ titles, disabledTabs, setSelectedTab, selectedTab }) => {
  return (
    <>
      <div className="flex items-center justify-between space-x-10 md:space-x-12">
        {titles.map((title, index) => (
          <Fragment key={`${index}-${title}`}>
            <motion.button
              type="button"
              disabled={disabledTabs?.[index]}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTab(index)}
              className={`${
                index === selectedTab ? 'border-b-4 border-black dark:border-white' : ''
              } ${disabledTabs?.[index] ? 'text-gray-500/50' : ''}`}
            >
              {title}
            </motion.button>
          </Fragment>
        ))}
      </div>
    </>
  );
};

export default TabGroup;
