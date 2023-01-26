import { NextSeo } from 'next-seo';
import NEXT_SEO_DEFAULT from 'next-seo.config';

import { AchievementSEO } from '@/Shared/SEO';
import { BRAND_IMAGE } from '@/utils/constants';

const Head = async ({ params }: { params: { handle: string } }) => {
  const handle = params?.handle;
  if (!handle) return <NextSeo {...NEXT_SEO_DEFAULT} useAppDir />;

  return <AchievementSEO handle={handle} imageUrl={BRAND_IMAGE} description={'My Missions'} />;
};

export default Head;
