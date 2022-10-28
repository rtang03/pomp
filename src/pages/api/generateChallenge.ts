import type { NextApiRequest, NextApiResponse } from 'next';
import pkceChallenge from 'pkce-challenge';

const generateChallenge = async (req: NextApiRequest, res: NextApiResponse) => {
  // default length 43
  try {
    const pair = pkceChallenge();
    res.status(200).json(pair);
  } catch (error) {
    console.error('fail to generate pkce-challenge', error);
    res.status(500).end({ error });
  }
};

export default generateChallenge;
