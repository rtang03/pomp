'use client';

import { motion } from 'framer-motion';
import {
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type ReactNode,
  forwardRef
} from 'react';

import LoadingDots from './LoadingDots';

interface SaveProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  canSave?: boolean;
  children?: ReactNode;
  loading?: boolean;
  className?: string;
  text?: 'Save' | 'Publish' | ReactNode;
  reset?: () => void;
}

const SaveButton = forwardRef<HTMLButtonElement, SaveProps>(function SaveButton(
  { reset, text = 'Save', className = '', canSave, loading, children, ...rest },
  ref
) {
  return (
    <>
      <div>
        <button
          ref={ref}
          disabled={!canSave}
          className={`${
            !canSave
              ? 'cursor-not-allowed text-black/20 dark:border-gray-600 dark:text-gray-600'
              : 'border-black text-black dark:border-white dark:text-white'
          } h-12 w-32 border-2 text-lg transition-all duration-150 ease-in-out focus:outline-none
                ${loading ? 'bg-gray-200' : ''}
                `}
          {...rest}
        >
          {loading ? <LoadingDots /> : text}
        </button>
      </div>
      {reset && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          className="link-text text-xs"
          onClick={() => reset()}
        >
          Reset
        </motion.button>
      )}
    </>
  );
});

export default SaveButton;
