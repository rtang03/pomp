'use client';

import { type FC } from 'react';

const MissionMain: FC<{ stringifiedData: string }> = ({ stringifiedData }) => {
  console.log('client: ', stringifiedData);

  return <>Hello</>;
};

export default MissionMain;
