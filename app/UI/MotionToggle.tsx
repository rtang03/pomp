'use client';

import { motion } from 'framer-motion';
import { type FC, ReactNode, useEffect, useState } from 'react';

type Props = {
  firstContent: string | ReactNode;
  secondContent: string | ReactNode;
  enabled?: boolean;
  width?: string;
};

const MotionToggle: FC<Props> = ({ width = 20, firstContent, secondContent, enabled }) => {
  const [state, setState] = useState<boolean>(false);

  useEffect(() => {
    if (enabled !== undefined) {
      setState(enabled);
    }
  }, [enabled]);

  return (
    <div className="text-xs text-gray-500 dark:text-gray-200">
      {state && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.15 }}
          className={`md:w- w-16${width} inline-flex cursor-pointer justify-center`}
          onClick={() => setState((val) => !val)}
        >
          {firstContent}
        </motion.div>
      )}
      {!state && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.15 }}
          className={`md:w- w-16${width} inline-flex cursor-pointer justify-center`}
          onClick={() => setState((val) => !val)}
        >
          {secondContent}
        </motion.div>
      )}
    </div>
  );
};

export default MotionToggle;
