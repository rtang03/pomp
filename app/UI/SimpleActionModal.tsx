'use client';

import { motion } from 'framer-motion';
import type { Dispatch, FC, ReactNode } from 'react';

import Modal from '@/UI/Modal';

import LoadingDots from './LoadingDots';

type Props = {
  showModal: boolean;
  setShowModal: Dispatch<boolean>;
  isLoading: boolean;
  body?: ReactNode;
  handleClick: () => void;
  actionText: string | ReactNode;
  buttonText: string | ReactNode;
  footer?: ReactNode;
  reset?: () => void;
  disabled: boolean;
};

const SimpleActionModal: FC<Props> = ({
  handleClick,
  showModal,
  setShowModal,
  isLoading,
  body,
  actionText,
  buttonText,
  footer,
  reset,
  disabled
}) => (
  <Modal isOpen={showModal} handleClose={() => setShowModal(false)}>
    <div className="flex-col justify-center space-y-10 p-5 text-center">
      <div>{actionText} Are you absolutely sure?</div>
      {body && <>{body}</>}
      <div className="flex-col justify-center">
        <div>
          <motion.button
            disabled={disabled}
            className="w-32 border-2 border-gray-300 py-2 px-5 text-center hover:border-black dark:border-gray-900 dark:hover:border-white"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
          >
            {isLoading ? <LoadingDots /> : <>{buttonText}</>}
          </motion.button>
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
      </div>
      {footer && <>{footer}</>}
    </div>
  </Modal>
);

export default SimpleActionModal;
