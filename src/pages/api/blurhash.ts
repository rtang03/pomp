import type { NextApiRequest, NextApiResponse } from 'next';
import { getPlaiceholder } from 'plaiceholder';

const blurhash = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.query;

  try {
    const { blurhash } = await getPlaiceholder(url as string);

    res.status(200).json(blurhash);
  } catch (error) {
    console.error(error);
    res.status(500).end(error);
  }
};

export default blurhash;
