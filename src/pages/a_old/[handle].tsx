import Achievement from '@components/Profile/Achievement';
import { convertToTMission } from '@hooks/useProfileMissionQuery';
import { BigNumber, ethers, utils } from 'ethers';
import fill from 'lodash/fill';
import { GetStaticPaths, GetStaticProps } from 'next';
import missionABI from 'smart-contract/abi/contracts/MissionModule.sol/MissionModule.json';
import pompABI from 'smart-contract/abi/contracts/PompHub.sol/PompHub.json';
import { MISSION_MODULE_ADDRESS, POMP_ADDRESS } from 'src/networks';
import type { PathProps, SiteProps } from 'src/types';
import { isMissionStruct, isProfileStruct } from 'src/types';

export default Achievement;

// TODO: Add Polygon and Mainnet later

// Notes: Under SSG, getStaticPaths and getStaticProps is NOT wrapped
// of WagmiConfig component. Both JsonRpcProvider and AlchemyProvider
// are given explicitly.
const IS_LOCALHOST = process.env.IS_LOCALHOST === 'true';
const IS_MUMBAI = process.env.DEFAULT_NETWORK === 'mumbai';
const provider = IS_LOCALHOST
  ? new ethers.providers.JsonRpcProvider()
  : IS_MUMBAI
  ? new ethers.providers.AlchemyProvider(80001, process.env.ALCHEMY_MUMBAI)
  : new ethers.providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI);

export const getStaticPaths: GetStaticPaths<PathProps> = async () => {
  const pompContract = new ethers.Contract(POMP_ADDRESS, pompABI, provider);
  const profileIdCounter = await pompContract.profileIdCounter();
  const profileCount = BigNumber.from(profileIdCounter).toNumber();

  if (profileCount === 1) return { paths: [], fallback: 'blocking' };

  const profileIdArray = fill(Array(profileCount - 1), 1).map((val, i) => i + val);
  const handles = [];
  for await (const profileId of profileIdArray) {
    const handle: string = await pompContract.getHandle(profileId);
    handles.push(handle);
  }
  return {
    paths: handles.map((handle) => ({ params: { handle } })),
    fallback: true
  };
};

export const getStaticProps: GetStaticProps<SiteProps, PathProps> = async ({ params }) => {
  if (!params) throw new Error('No path parameters found');
  const { handle } = params;
  const pompContract = new ethers.Contract(POMP_ADDRESS, pompABI, provider);

  const missionModuleContract = new ethers.Contract(MISSION_MODULE_ADDRESS, missionABI, provider);
  const profile: unknown = await pompContract.profileByHandle(handle);
  const profileId = await pompContract.profileIdByHandle(handle);
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
    const result = await pompContract.missionById(profileId, missionId);
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

    return { props: { stringifiedData } };
  } else return { notFound: true };
};
