import { SingleNftByTokenUri } from '@components/Profile/SingleNft';
import { AchievementSEO } from '@components/Shared/SEO';
import Loader from '@components/UI/Loader';
import type { NextPageWithLayout } from '@pages/_app';
import Custom404 from '@pages/404';
import { elog } from '@utils/consoleLog';
import { useRouter } from 'next/router';
import { BRAND_IMAGE } from 'src/constants';
import type { MissionStruct, SiteProps } from 'src/types';
import { isProfileStruct } from 'src/types';

const Achievement: NextPageWithLayout<SiteProps> = ({ stringifiedData }) => {
  const router = useRouter();

  if (router.isFallback) return <Loader />;

  let m;

  try {
    m = JSON.parse(stringifiedData);
  } catch {
    elog('[Achievement]', m);
  }

  if (isProfileStruct(m.profile)) {
    const profile = m.profile;
    // const profileId = m.profileId;
    const missions = m.missions as {
      mission: MissionStruct;
      missionId: string;
      tokenURI: string;
    }[];

    return (
      <>
        <AchievementSEO
          handle={profile.handle}
          imageUrl={BRAND_IMAGE}
          description={`You have made ${missions.length} mission`}
        />
        <div className="flex flex-col items-center justify-center">
          <div className="m-auto w-full text-center md:w-7/12">
            <h1 className="mb-10 font-cal text-3xl font-bold text-gray-800 dark:text-white md:text-6xl">
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

Achievement.getLayout = (page) => <>{page}</>;

export default Achievement;
