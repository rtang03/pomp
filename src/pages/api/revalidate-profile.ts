import type { NextApiRequest, NextApiResponse } from 'next';

const SECRET = process.env.REVALIDATE_SECRET;

const revaliate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug, secret, delay_in_sec } = req.query;
  if (secret !== SECRET) {
    console.log('fail to revalidate: invalid secret');
    return res.status(401).json({ message: 'Invalid secret' });
  }
  const delay = parseInt(delay_in_sec as string, 10) || 5; // default 5 seconds
  const waitForSecond = new Promise((resolve) => setTimeout(() => resolve(true), delay * 1000));

  try {
    await waitForSecond;
    await res.revalidate(`/a/${slug}`);
    console.log(`Revalidated: /a/${slug}`);
    res.json({ revalidated: true });
  } catch (err) {
    console.error('fail to revalidate profile: ', err);
    res.status(500).send('Error revalidating');
  }
};

export default revaliate;
