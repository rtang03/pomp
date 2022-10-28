import { useNftsByEnumerableIndexes } from '@hooks/useProfileMissionQuery';
import { BigNumber } from 'ethers';
import fill from 'lodash/fill';
import isEqual from 'lodash/isEqual';
import { type FC } from 'react';
import { useAccount, useContractRead } from 'wagmi';

import { nftContract } from '../../networks';
import { SingleNftByTokenId } from './SingleNft';

const Nfts: FC = () => {
  const { address } = useAccount();
  const { data: enumerableIndexes, isSuccess } = useContractRead({
    ...nftContract,
    functionName: 'balanceOf',
    args: [address as any],
    enabled: !address
  });
  const isZero = isSuccess ? BigNumber.from(enumerableIndexes).eq('0x00') : null;
  // returns something like, ['0x01', '0x02', '0x03']
  const enumerable = isSuccess
    ? isZero
      ? []
      : fill(Array(BigNumber.from(enumerableIndexes).toNumber()), 0).map((val, index) =>
          BigNumber.from(val + index).toHexString()
        )
    : null;
  const { tokenURIs, isSuccess: nftsIsSuccess } = useNftsByEnumerableIndexes(
    address as string,
    enumerable as string[],
    !address || isZero === true || !isSuccess
  );
  const tokenIds = nftsIsSuccess ? tokenURIs?.map((item: any) => BigNumber.from(item)) : null;

  return (
    <div>
      <h1 className="page-top-header">Achievement</h1>
      <div className="mb-20 space-y-6">
        <h2 className="page-section-title hidden md:block">Verified Missions</h2>
        {(isEqual(tokenIds, []) || !tokenIds) && <div>0</div>}
        <div className="block md:flex md:space-x-2">
          {tokenIds?.map((tokenId, key) => (
            <SingleNftByTokenId key={`nfttokenId-${key}`} tokenId={tokenId} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Nfts;
