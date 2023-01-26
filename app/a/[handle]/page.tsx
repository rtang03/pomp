import { BigNumber } from 'ethers';
import fill from 'lodash/fill';

import type { GenerateStaticParams } from '@/types/next';

import { getData, getPompContract } from './getData';
import Main from './Main';

export const dynamicParams = true;
export const revalidate = 60;

export const generateStaticParams: GenerateStaticParams<{ handle: string }> = async () => {
  const profileIdCounter = await getPompContract().profileIdCounter();
  const profileCount = BigNumber.from(profileIdCounter).toNumber();

  // hack: profileCount starts at 1
  if (profileCount === 1) return [];

  const profileIdArray = fill(Array(profileCount - 1), 1).map((val, i) => i + val);
  const result: { handle: string }[] = [];
  for await (const profileId of profileIdArray) {
    const handle: string = await getPompContract().getHandle(profileId);
    result.push({ handle });
  }
  return result;
};

// @ts-expect-error Server Component
const AchievementPage = async (props) => {
  const { params } = props;
  const handle = params?.handle;

  if (!handle) return null;

  const { stringifiedData } = await getData(handle)();

  return (
    <>
      <Main stringifiedData={stringifiedData} />
    </>
  );
};

export default AchievementPage;
