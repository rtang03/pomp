'use client';

import Custom404 from '@pages/404';
import { type FC } from 'react';

import { type MissionStruct, isProfileStruct } from '@/types/PompContractStruct';
import { elog } from '@/utils/consoleLog';

import { SingleNftByTokenUri } from './SingleNft';

const AchievementMain: FC<{ stringifiedData: string }> = ({ stringifiedData }) => {
  let m;

  try {
    m = JSON.parse(stringifiedData);
  } catch {
    elog('[Achievement]', m);
  }

  if (isProfileStruct(m.profile)) {
    const profile = m.profile;
    const missions = m.missions as {
      mission: MissionStruct;
      missionId: string;
      tokenURI: string;
    }[];

    return (
      <>
        <div className="flex flex-col items-center justify-center">
          <div className="m-auto w-full text-center md:w-7/12">
            <h1 className="mb-10 font-sans text-3xl font-bold text-gray-800 dark:text-white md:text-6xl">
              Achievement
            </h1>
            <p className="m-auto w-10/12 text-base text-gray-600 dark:text-white/50 md:text-lg">
              {profile.handle}
            </p>
            <div className="my-10 flex justify-center space-x-2 border-b border-gray-500/30 text-xl text-blue-500">
              You have made {missions.length} mission.
            </div>
            <div className="block md:flex md:space-x-2">
              {missions.map(({ mission, missionId, tokenURI }) => (
                <SingleNftByTokenUri key={mission.challengeHash} tokenURI={tokenURI} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return <Custom404 />;
};

export default AchievementMain;
