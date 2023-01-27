'use client';

import { logEvent } from '@firebase/analytics';
import Custom404 from '@pages/404';
import { motion } from 'framer-motion';
import { type FC, useState } from 'react';
import DatePicker from 'react-datepicker';

import useAppContext from '@/Shared/AppContext';
import ContentMarkdown from '@/Shared/ContentMarkdown';
import { type MissionDocument, isMissionDocument } from '@/types/MissionDocument';
import BlurImage from '@/UI/BlurImage';
import { ModalWithConnectWalletMessage } from '@/UI/ConnectWalletMessage';
import { elog } from '@/utils/consoleLog';

import Start from './Start';

export const formatDate = (_updatedAt: Date) =>
  `Published at ${Intl.DateTimeFormat('en', { month: 'short' }).format(
    new Date(_updatedAt)
  )} ${Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date(_updatedAt))}`;

const MissionMain: FC<{ stringifiedData: string }> = ({ stringifiedData }) => {
  const { isAuthenticated, analytics, user } = useAppContext();
  const [showStartMission, setShowStartMission] = useState<boolean>(false);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState<boolean>(false);

  let m: unknown;
  try {
    m = JSON.parse(stringifiedData);
  } catch {
    elog('[PublishedMission]', m);
  }
  // <Start setShow={setShowStartMission} missionDoc={m as Required<MissionDocument>} />
  if (isMissionDocument(m)) {
    const isReady = m.status === 'Published';

    return (
      <>
        {showStartMission ? (
          <Start setShow={setShowStartMission} missionDoc={m as Required<MissionDocument>} />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div
              className={`md:h-150 lg:2/3 relative m-auto mb-10 h-80 w-full max-w-screen-2xl overflow-hidden md:mb-20 md:w-5/6 md:rounded-2xl`}
            >
              {m?.image ? (
                <div className="relative h-[550px] w-full">
                  <BlurImage
                    alt={m.title ?? 'mission cover'}
                    placeholder="blur"
                    blurDataURL={m.imageBlurhash ?? undefined}
                    src={m.image}
                  />
                </div>
              ) : (
                <div className="absolute flex h-full w-full select-none items-center justify-center bg-gray-100 text-4xl text-gray-500">
                  ?
                </div>
              )}
            </div>
            <div className="m-auto w-full text-center md:w-7/12">
              <h1 className="mb-10 font-sans text-3xl font-bold text-gray-800 dark:text-white md:text-6xl">
                {m.title || 'Untitled'}
              </h1>
              {m?.updatedAt && (
                <p className="m-auto my-5 w-10/12 text-sm font-light text-gray-500 md:text-base">
                  {formatDate(new Date(m.updatedAt))}
                </p>
              )}
              <p className="m-auto w-10/12 text-base text-gray-600 dark:text-white/50 md:text-lg">
                {m.description || 'No description provided'}
              </p>
            </div>
            <div className="space-y-6">
              <div className="my-10 flex items-baseline justify-center space-x-3.5">
                <motion.button
                  disabled={!isReady}
                  onClick={() => {
                    isAuthenticated ? setShowStartMission(true) : setShowConnectWalletModal(true);
                    isAuthenticated &&
                      analytics &&
                      logEvent(analytics, 'level_start', {
                        level_name: 'start mission'
                      });
                  }}
                  whileTap={{ scale: isReady ? 0.9 : 1 }}
                  type="button"
                  className={`cta-big-button ${isReady ? '' : 'opacity-50'}`}
                >
                  {isReady ? 'Start' : 'Not Available'}
                </motion.button>
              </div>
            </div>
            <div className="block space-y-5 md:flex md:space-y-0 md:space-x-5">
              <div>
                <div>Start date</div>
                {m?.startdate?.seconds ? (
                  <DatePicker
                    className="dark:bg-transparent"
                    onChange={() => {}}
                    selected={new Date(m.startdate.seconds * 1000)}
                    disabled
                  />
                ) : (
                  <>No info</>
                )}
              </div>
              <div>
                <div>End date</div>
                {m?.enddate?.seconds ? (
                  <DatePicker
                    className="dark:bg-transparent"
                    onChange={() => {}}
                    selected={new Date(m.enddate.seconds * 1000)}
                    disabled
                  />
                ) : (
                  <>No info</>
                )}
              </div>
            </div>
            <div className="my-5 flex justify-center space-x-2 border-b border-gray-500/30 text-xl text-blue-500 md:my-10">
              How to complete this mission
            </div>
            <div className="flex justify-center py-5">
              <div className="prose dark:prose-invert">
                <ContentMarkdown content={m.content || 'No Content'} />
              </div>
            </div>
          </div>
        )}
        <ModalWithConnectWalletMessage
          showConnectWalletMessage
          showModal={showConnectWalletModal}
          setShowModal={setShowConnectWalletModal}
        />
      </>
    );
  }

  return <Custom404 />;
};

export default MissionMain;
