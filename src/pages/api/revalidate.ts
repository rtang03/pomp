import type { NextApiRequest, NextApiResponse } from 'next';

const SECRET = process.env.REVALIDATE_SECRET;

const revaliate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, secret, update_index_page } = req.query;

  // Check for secret to confirm this is a valid request
  if (secret !== SECRET) {
    console.log('fail to revalidate: invalid secret');
    return res.status(401).json({ message: 'Invalid secret' });
  }

  try {
    // this should be the actual path not a rewritten path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1"
    await res.revalidate(`/m/${slug}`);
    const updateIndexPage = update_index_page === 'true';
    updateIndexPage && (await res.revalidate('/'));

    console.log(`Revalidated: ${updateIndexPage ? '/ and' : ''} /m/${slug}`);

    return res.json({ revalidated: true });
  } catch (err) {
    console.error('fail to revalidate: ', err);

    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).send('Error revalidating');
  }
};

export default revaliate;
