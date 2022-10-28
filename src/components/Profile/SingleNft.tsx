import { useIpfsMetadataQuery } from '@hooks/useIpfsMetadataQuery';
import { useNftById } from '@hooks/useProfileMissionQuery';
import { BigNumber } from 'ethers';
import { useTheme } from 'next-themes';
import { type FC } from 'react';
import { IPFS_DEDICATED_GATEWAY } from 'src/constants';
import { getAttributebyTraitType } from 'src/types';

export const SingleNftByTokenId: FC<{
  tokenId: BigNumber;
}> = ({ tokenId }) => {
  const { theme } = useTheme();
  const {
    data,
    isSuccess: nftByIdSuccess,
    error: nftByIdError
  } = useNftById(BigNumber.from(tokenId).toHexString(), !tokenId);
  const uri = data?.replace('ipfs://', `${IPFS_DEDICATED_GATEWAY}/`);
  const { metadata, metadataError, isSuccess: ipfsMetadataSucess } = useIpfsMetadataQuery(uri);
  const title = getAttributebyTraitType(metadata?.attributes, 'title') as string;

  return (
    <>
      {nftByIdSuccess && ipfsMetadataSucess && title && (
        <>
          <img alt={title} src={`/api/badge?title=${title}&theme=${theme}`} />
        </>
      )}
      {(metadataError || nftByIdError) && (
        <div className="text-[10px] md:text-base">Oops, fail to retrieve {data}</div>
      )}
    </>
  );
};

export const SingleNftByTokenUri: FC<{ tokenURI: string }> = ({ tokenURI }) => {
  const { theme } = useTheme();
  const uri = tokenURI?.replace('ipfs://', `${IPFS_DEDICATED_GATEWAY}/`);
  const { metadata, metadataError, isSuccess } = useIpfsMetadataQuery(uri);
  const title = getAttributebyTraitType(metadata?.attributes, 'title') as string;

  return (
    <>
      {isSuccess && title && <img alt={title} src={`/api/badge?title=${title}&theme=${theme}`} />}
      {metadataError && (
        <div className="text-[10px] md:text-base">Oops, fail to retrieve {tokenURI}</div>
      )}
    </>
  );
};
