import { PageSEO } from '@/Shared/SEO';
import { BRAND_IMAGE } from '@/utils/constants';

import { getData } from './getData';

const Head = async ({ params }: { params: { id: string } }) => {
  const data = await getData(params.id);

  return (
    <PageSEO
      title={data?.title || 'Pomp'}
      description={data?.description || 'No description'}
      imageUrl={
        data?.image
          ? `${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''}/api/og?title=${
              data?.title || 'Pomp'
            }&imageurl=${data?.image}`
          : BRAND_IMAGE
      }
    />
  );
};

export default Head;
