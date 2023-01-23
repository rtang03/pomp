import { BRAND_IMAGE } from 'src/constants';

import { PageSEO } from '../../Shared/SEO';
import { getData } from './getData';

/* @ts-expect-error Server Component */
async function Head(props) {
  const { params } = props;
  const { id } = params;
  const data = await getData(id);

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
}

export default Head;
