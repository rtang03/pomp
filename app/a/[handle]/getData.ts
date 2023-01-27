import 'server-only';

import { BigNumber, ethers, utils } from 'ethers';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import missionABI from 'smart-contract/abi/contracts/MissionModule.sol/MissionModule.json';
import pompABI from 'smart-contract/abi/contracts/PompHub.sol/PompHub.json';

import { isMissionStruct, isProfileStruct } from '@/types/PompContractStruct';
import { convertToTMission } from '@/utils/convertToTMission';
import { MISSION_MODULE_ADDRESS, POMP_ADDRESS } from '@/utils/networks';

const IS_LOCALHOST = process.env.IS_LOCALHOST === 'true';
const IS_MUMBAI = process.env.DEFAULT_NETWORK === 'mumbai';
const provider = IS_LOCALHOST
  ? new ethers.providers.JsonRpcProvider()
  : IS_MUMBAI
  ? new ethers.providers.AlchemyProvider(80001, process.env.ALCHEMY_MUMBAI)
  : new ethers.providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI);

let pompContract: ethers.Contract;
let missionModuleContract: ethers.Contract;
export const getData = (handle: string) =>
  cache(async () => {
    missionModuleContract =
      missionModuleContract || new ethers.Contract(MISSION_MODULE_ADDRESS, missionABI, provider);
    const profile: unknown = await getPompContract().profileByHandle(handle);
    const profileId: string = await getPompContract().profileIdByHandle(handle);
    const decodeUint256 = (input: any) =>
      utils.defaultAbiCoder.decode(['uint256'], input)[0].toHexString();

    const ids = await missionModuleContract
      .queryFilter(
        missionModuleContract.filters.Verified(null, BigNumber.from(profileId).toHexString(), null)
      )
      .then((events) =>
        events.map(({ topics }) => ({
          profileId: decodeUint256(topics[2]),
          missionId: decodeUint256(topics[3])
        }))
      );

    const missions: unknown[] = [];

    for await (const { profileId, missionId } of ids) {
      const result = await getPompContract().missionById(profileId, missionId);
      if (isMissionStruct(result[0])) {
        missions.push({
          mission: convertToTMission(result),
          missionId: BigNumber.from(result[1]).toHexString(),
          tokenURI: result[2]
        });
      }
    }

    if (isProfileStruct(profile)) {
      const stringifiedData = JSON.stringify({
        profile: {
          missionCount: BigNumber.from(profile[0]).toNumber(),
          handle: profile[1],
          owner: profile[2]
        },
        profileId: BigNumber.from(profileId).toHexString(),
        missions
      });
      return { stringifiedData };
    } else notFound();
  });

export const getPompContract = () => {
  pompContract = pompContract || new ethers.Contract(POMP_ADDRESS, pompABI, provider);

  return pompContract;
};
