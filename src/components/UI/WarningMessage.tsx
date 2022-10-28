import { motion } from 'framer-motion';
import { type FC, type ReactNode, useState } from 'react';

type Props = {
  title?: string | ReactNode;
  message?: string | ReactNode;
  className?: string;
  isFYI?: boolean;
  showDismiss?: boolean;
};

export const WarningMessage: FC<Props> = ({
  title,
  isFYI,
  showDismiss,
  message,
  className = ''
}) => {
  const [dismiss, setDismiss] = useState<boolean>(false);

  if (!message) return null;

  return (
    <>
      {dismiss ? null : (
        <div
          className={`${
            isFYI
              ? 'border-blue-500/50 bg-teal-50 dark:bg-teal-900/10'
              : 'dark:bg-yellow-900/1- border-yellow-500/50 bg-yellow-50'
          } space-y-1 rounded-xl border-2 p-4 ${className}`}
        >
          <div className="flex justify-between">
            {title ? (
              <h3
                className={`${
                  isFYI
                    ? 'text-blue-800 dark:text-blue-500'
                    : 'text-yellow-800 dark:text-yellow-200'
                } text-sm font-medium`}
              >
                {title}
              </h3>
            ) : (
              <div />
            )}
            {showDismiss && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                className="link-text-no-underline -mt-4 text-lg leading-3 opacity-50"
                onClick={() => setDismiss(true)}
              >
                X
              </motion.button>
            )}
          </div>
          <div
            className={`${
              isFYI ? 'text-gray-700 dark:text-gray-200' : 'text-yellow-700 dark:text-yellow-200'
            } text-sm `}
          >
            {message}
          </div>
        </div>
      )}
    </>
  );
};
