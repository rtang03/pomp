import { BigNumber } from 'ethers';

import { TMission } from '@/hooks/useProfileMissionQuery';

export const fromBNToHexString = (input: BigNumber | undefined) => {
  const value = input !== undefined && input !== null ? BigNumber.from(input).toHexString() : null;
  return value === '0x00' ? null : value;
};

export const convertToTMission: (item: unknown) => TMission | null = (item) => {
  if (Array.isArray(item))
    return {
      challengeHash: item[0][6],
      endtime: BigNumber.from(item[0][5]).toNumber(),
      owner: item[0][0],
      profileId: fromBNToHexString(item[0][1]),
      starttime: BigNumber.from(item[0][4]).toNumber(),
      state: item[0][7],
      tokenId: fromBNToHexString(item[0][2]),
      verifier: item[0][3],
      missionId: BigNumber.from(item[1]).toNumber(),
      tokenURI: item[2],
      creator: item[0][8]
    };
  return null;
};
