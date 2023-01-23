'use client';

import { useAppContext } from '@components/AppContext';
import { elog } from '@utils/consoleLog';
import { type FC, useState } from 'react';

const MissionMain: FC<{ stringifiedData: string }> = ({ stringifiedData }) => {
  const { isAuthenticated, analytics } = useAppContext();
  const [showStartMission, setShowStartMission] = useState<boolean>(false);
  const [showConnectWalletModal, setShowConnectWalletModal] = useState<boolean>(false);

  let m: unknown;
  try {
    m = JSON.parse(stringifiedData);
  } catch {
    elog('[PublishedMission]', m);
  }

  return <>Hello</>;
};

export default MissionMain;
