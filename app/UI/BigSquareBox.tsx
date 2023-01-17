'use client';

import { motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';

type Props = {
  text: string | ReactNode;
  formSubmit?: boolean;
  handleClick?: () => void;
  disabled?: boolean;
};

const BigSquareBox: FC<Props> = ({ text, disabled, formSubmit, handleClick }) => (
  <motion.button
    disabled={disabled}
    type={`${formSubmit ? 'submit' : 'button'}`}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    onClick={handleClick}
    className={`${
      disabled ? 'cursor-not-allowed opacity-50' : ''
    } h-32 w-full rounded-xl border-2 border-teal-500 hover:border-blue-500 hover:text-blue-500 md:h-64 md:w-64`}
  >
    {text}
  </motion.button>
);

export default BigSquareBox;
