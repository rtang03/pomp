import { motion } from 'framer-motion';
import type { FC } from 'react';

type Props = {
  isStart: boolean;
  isEnd: boolean;
  getNext: () => void;
  getPrev: () => void;
};

const Pagination: FC<Props> = ({ isStart, isEnd, getPrev, getNext }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="xs:mt-0 my-8 flex space-x-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={isStart}
          onClick={getPrev}
          className={`${
            isStart ? 'opacity-50' : ''
          } border-b-4 border-gray-300 bg-white px-6 hover:border-gray-500 dark:border-gray-700 dark:bg-transparent hover:dark:border-gray-200`}
        >
          PREV
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          disabled={isEnd}
          onClick={getNext}
          className={`${
            isEnd ? 'opacity-50' : ''
          } border-b-4 border-gray-300 bg-white px-6 hover:border-gray-500 dark:border-gray-700 dark:bg-transparent hover:dark:border-gray-200`}
        >
          NEXT
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
