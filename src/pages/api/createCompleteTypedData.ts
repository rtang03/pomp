import { getDeadline, getDomainSeparator, getSigNonce, requirePostMethod } from '@pages/api/_lib';
import { BigNumber } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

const IS_LOCALHOST = process.env.IS_LOCALHOST === 'true';

const createCompleteTypedData = async (req: NextApiRequest, res: NextApiResponse) => {
  requirePostMethod(req, res);
  // const isLocalhost = req.headers.host?.includes('localhost');

  try {
    const { address, profileId, missionId, challenge } = JSON.parse(req.body);

    res.status(200).json({
      domain: await getDomainSeparator(IS_LOCALHOST),
      types: {
        Complete: [
          { name: 'profileId', type: 'uint256' },
          { name: 'missionId', type: 'uint256' },
          { name: 'challenge', type: 'string' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      },
      value: {
        profileId: BigNumber.from(profileId),
        missionId: BigNumber.from(missionId),
        challenge,
        nonce: await getSigNonce(address, IS_LOCALHOST),
        deadline: getDeadline()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).end({ error });
  }
};

export default createCompleteTypedData;
