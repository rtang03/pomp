import { getDeadline, getDomainSeparator, getSigNonce, requirePostMethod } from '@pages/api/_lib';
import { BigNumber } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

const IS_LOCALHOST = process.env.IS_LOCALHOST === 'true';

const createStartTypedData = async (req: NextApiRequest, res: NextApiResponse) => {
  requirePostMethod(req, res);
  // const isLocalhost = req.headers.host?.includes('localhost');

  try {
    const { address, profileId, slug, contentURI, minutesToExpire, creator, verifier } = JSON.parse(
      req.body
    );

    res.status(200).json({
      domain: await getDomainSeparator(IS_LOCALHOST),
      types: {
        Start: [
          { name: 'profileId', type: 'uint256' },
          { name: 'slug', type: 'string' },
          { name: 'contentURI', type: 'string' },
          { name: 'minutesToExpire', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'verifier', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      value: {
        profileId: BigNumber.from(profileId),
        slug,
        contentURI,
        minutesToExpire,
        creator,
        verifier,
        nonce: await getSigNonce(address, IS_LOCALHOST),
        deadline: getDeadline()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).end({ error });
  }
};

export default createStartTypedData;
