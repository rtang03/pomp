import { motion } from 'framer-motion';
import type { FC, ReactNode } from 'react';

type Props = {
  className?: string;
  children?: string | ReactNode;
  handleClick?: () => void;
  disabled?: boolean;
};

export const Button: FC<Props> = ({ disabled, children, className, handleClick }) => {
  return (
    <motion.button
      disabled={disabled}
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      type="button"
      className={`w-32 border-2 border-gray-500 p-2 hover:border-black ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const LinkTextButton: FC<{
  text: string | ReactNode;
  handleClick: () => void;
  disabled?: boolean;
}> = ({ handleClick, text, disabled }) => (
  <motion.button
    disabled={disabled}
    type="button"
    whileTap={{ scale: 0.95 }}
    className="link-text text-sm"
    onClick={handleClick}
  >
    {text}
  </motion.button>
);

export const SmallBackButton: FC<{ handleClick: () => void }> = ({ handleClick }) => {
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      className="mt-2 font-bold hover:opacity-50 md:mt-10"
      whileTap={{ scale: 0.95 }}
    >
      ← back
    </motion.button>
  );
};
