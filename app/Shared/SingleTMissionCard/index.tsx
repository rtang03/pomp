'use client';

import { useIpfsMetadataQuery } from '@hooks/useIpfsMetadataQuery';
import { type TMission } from '@hooks/useProfileMissionQuery';
import { type FC, useState } from 'react';

import { getAttributebyTraitType } from '@/types/Metadata';
import BlurImage from '@/UI/BlurImage';
import { LinkTextButton } from '@/UI/Button';
import { Card } from '@/UI/Card';
import { IPFS_DEDICATED_GATEWAY } from '@/utils/constants';
import { formatDate, getMissionId } from '@/utils/formatter';
import { shortenAddress } from '@/utils/shortenAddress';

import Abort from './Abort';
import Complete from './Complete';
import Fail from './Fail';
import Verify from './Verify';

const Index: FC<{
  mission: TMission;
  refetch?: any;
  // the loggin address is role of Verifier in smart contract
  isVerifier: boolean;
  // Render from Creator Page. It does not mean to creator role
  isCreatorPage: boolean;
}> = ({ mission, refetch, isVerifier, isCreatorPage }) => {
  const [showAbortModal, setShowAbortModal] = useState<boolean>(false);
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const status = {
    0: 'Started',
    1: 'Aborted',
    2: 'Completed',
    3: 'Verified',
    4: 'Failed'
  }[mission.state];
  const uri = mission.tokenURI?.replace('ipfs://', `${IPFS_DEDICATED_GATEWAY}/`);
  const { metadata, metadataError } = useIpfsMetadataQuery(uri);
  const verifier = mission.verifier;
  const owner = mission.owner;
  const tokenId = mission.tokenId;
  const name = metadata?.name;
  const description = metadata?.description;
  const image = metadata?.media?.[0]?.item;
  const title = getAttributebyTraitType(metadata?.attributes, 'title');
  const objectId = getAttributebyTraitType(metadata?.attributes, 'mission_slug');
  const endDate = mission.endtime * 1000;
  const creator = mission.creator;

  return (
    <div>
      <Card className="block justify-between space-y-2 md:flex md:space-x-10">
        <div className="block overflow-hidden md:flex md:space-x-5">
          <div className="w-full overflow-hidden md:h-[220px] md:w-40">
            {image ? (
              <div className="relative h-[150px] w-[150px]">
                <BlurImage
                  alt={name ?? 'Unknown Thumbnail'}
                  src={image}
                  blurDataURL={getShimmer()}
                  placeholder="blur"
                />
              </div>
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-2xl text-gray-500 md:h-full">
                No cover
              </div>
            )}
          </div>
          <div className="flex-col p-2">
            <a
              target="_blank"
              rel="noreferrer"
              href={`/m/${objectId}`}
              className="flex-col items-baseline text-blue-500"
            >
              <div className="text-xl line-clamp-1">{title || 'No Title'}</div>
              <div className="text-sm leading-3">({name})</div>
            </a>
            <div className="line-clamp-2">{description || 'No description'}</div>
            <div>Creator: {shortenAddress(creator)}</div>
            {isVerifier ? (
              <div>Player: {shortenAddress(owner)}</div>
            ) : (
              <div>Verifier: {shortenAddress(verifier)}</div>
            )}
            <div className="italic">{formatDate(endDate, 'Deadline')}</div>
            <>{metadataError && <div className="text-red-500">Something bad happens</div>}</>
          </div>
        </div>
        <div className="flex-col space-y-6 px-2">
          <div className="flex justify-start space-x-2 md:justify-end">
            <div className="font-sans font-semibold">{status}</div>
            <div>{getMissionId(mission)}</div>
          </div>
          {status === 'Started' && !isCreatorPage && (
            <div className="flex justify-start space-x-2 md:justify-end">
              <LinkTextButton handleClick={() => setShowAbortModal(true)} text="ABORT" />
              <LinkTextButton handleClick={() => setShowCompleteModal(true)} text="COMPLETE" />
            </div>
          )}
          {status == 'Completed' && !isVerifier && !isCreatorPage && (
            <div className="flex justify-start space-x-2 md:justify-end">
              <LinkTextButton text={'REQUEST VERIFICATION'} handleClick={() => {}} />
            </div>
          )}
          {status == 'Completed' && isVerifier && !isCreatorPage && (
            <div className="flex justify-start space-x-2 md:justify-end">
              <LinkTextButton handleClick={() => setShowVerifyModal(true)} text="VERIFY" />
              <LinkTextButton handleClick={() => setShowFailModal(true)} text="FAIL" />
            </div>
          )}
          {status === 'Verified' && (
            <div className="flex justify-start space-x-2 md:justify-end">
              <div>TokenId {tokenId}</div>
            </div>
          )}
        </div>
      </Card>
      <Abort
        mission={mission}
        showModal={showAbortModal}
        setShowModal={setShowAbortModal}
        refetch={refetch}
      />
      <Complete
        mission={mission}
        showModal={showCompleteModal}
        setShowModal={setShowCompleteModal}
        refetch={refetch}
      />
      <Verify mission={mission} showModal={showVerifyModal} setShowModal={setShowVerifyModal} />
      <Fail mission={mission} showModal={showFailModal} setShowModal={setShowFailModal} />
    </div>
  );
};

export default Index;

const getShimmer = () => {
  const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

  const toBase64 = (str: string) =>
    typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

  return `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`;
};
