'use client';

import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type FC, type ReactNode, useRef } from 'react';
import { MdOutlineClose } from 'react-icons/md';

type Props = {
  icon?: ReactNode;
  isOpen: boolean;
  handleClose: () => void;
  children: ReactNode | string;
  title?: ReactNode | string;
};

const Modal: FC<Props> = ({ icon, title, isOpen, handleClose, children }) => {
  const cancelButtonRef = useRef(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          initialFocus={cancelButtonRef}
          as={motion.div}
          className="fixed inset-0 z-20 overflow-y-auto"
          onClose={handleClose}
          open={isOpen}
        >
          <div className="min-h-screen px-4 text-center">
            <motion.div
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Dialog.Overlay className="fixed inset-0 bg-black/70 dark:bg-black/80" />
            </motion.div>
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <motion.div
              animate={{ opacity: 1, scale: 1.05 }}
              initial={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="my-8 inline-block w-full max-w-xl overflow-hidden rounded bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800"
            >
              <div className="container flex items-center">
                <div className="flex-1 justify-start">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      {icon && <div className="">{icon}</div>}
                      <div>{title}</div>
                    </div>
                  </Dialog.Title>
                </div>
                <div className="flex-1 justify-end text-right">
                  <motion.button
                    className="focus:outline-none"
                    whileTap={{ scale: 0.8 }}
                    ref={cancelButtonRef}
                    type="button"
                    onClick={handleClose}
                  >
                    <MdOutlineClose className="h-8 w-8 text-gray-500 opacity-50 hover:text-gray-400" />
                  </motion.button>
                </div>
              </div>
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;
