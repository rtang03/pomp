'use client';

import { motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';
import { BsPlusLg } from 'react-icons/bs';
import { FaRegCopy } from 'react-icons/fa';

import LoadingDots from './LoadingDots';

type Props = {
  formSubmit?: boolean;
  kind?: 'plus' | 'clone';
  text: string | ReactNode;
  onClickHandler?: () => void;
  loading?: boolean;
};

const SimplePlusButton: FC<Props> = ({
  formSubmit,
  onClickHandler,
  loading,
  text,
  kind = 'plus'
}) => (
  <motion.button
    type={`${formSubmit ? 'submit' : 'button'}`}
    whileTap={{ scale: 0.95 }}
    className="sidebar-icon flex h-12 w-[180px] items-center justify-center space-x-2 p-2"
    onClick={onClickHandler}
  >
    {loading ? (
      <LoadingDots />
    ) : (
      <>
        {kind === 'plus' ? <BsPlusLg /> : <FaRegCopy />}
        <>{text}</>
      </>
    )}
  </motion.button>
);

export default SimplePlusButton;
