import { useAppContext } from '@components/AppContext';
import type { Result } from '@ethersproject/abi';
import { usePompRead } from '@hooks/usePompOrNFTContract';
import { elog, log } from '@utils/consoleLog';
import { BigNumber, BigNumberish } from 'ethers';
import isEqual from 'lodash/isEqual';
import { ZERO_ADDRESS } from 'src/constants';
import { nftContract, pompContract } from 'src/networks';
import type { MissionStruct, ProfileStruct } from 'src/types';
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
  useContractRead,
  useContractReads
} from 'wagmi';

export type TContractReadResult = ReturnType<typeof useContractRead>;
export type TMission = MissionStruct & { missionId: number; tokenURI: string };
export type TContractInfiniteReadsRefetch = ReturnType<typeof useContractInfiniteReads>['refetch'];

const fromBNToHexString = (input: BigNumberish | Result | undefined) => {
  const value = input !== undefined && input !== null ? BigNumber.from(input).toHexString() : null;
  return value === '0x00' ? null : value;
};

export const convertToTMission: (item: Result) => TMission = (item) => ({
  challengeHash: item[0][6],
  endtime: BigNumber.from(item[0][5]).toNumber(),
  owner: item[0][0],
  profileId: fromBNToHexString(item[0][1]),
  starttime: BigNumber.from(item[0][4]).toNumber(),
  state: item[0][7],
  tokenId: fromBNToHexString(item[0][2]),
  verifier: item[0][3],
  missionId: BigNumber.from(item[1]).toNumber(),
  tokenURI: item[2],
  creator: item[0][8]
});

export const useClaimableByAddress = (address: string, proof: string[], skip?: boolean) => {
  const { dev } = useAppContext();
  const { data, error, isFetching, isError, isSuccess, refetch, isRefetching } = useContractReads({
    contracts: [
      { ...pompContract, functionName: 'claimed', args: [address] },
      { ...pompContract, functionName: 'profileIdByAddress', args: [address] },
      { ...pompContract, functionName: 'canClaim', args: [address, '00000000000', proof] },
      { ...pompContract, functionName: 'merkleroot', args: [] }
    ],
    enabled: !skip,
    onSuccess: (data) => dev && log('[useClaimProfileQuery]', data),
    onError: (error) => elog('[useClaimProfileQuery]', error)
  });
  const claimed = data?.[0];
  const _profileId = data?.[1];

  const profileId = fromBNToHexString(_profileId);
  const canClaim = !claimed && data?.[2] && profileId === null;

  return {
    refetch,
    profileId,
    merkleroot: data?.[3],
    error,
    canClaim,
    canClaimLoading: isFetching,
    canClaimError: error,
    isError,
    isSuccess,
    isRefetching
  };
};

export const useRoleHashQuery: (
  roleName: 'CREATOR' | 'VERIFIER' | 'PAUSER_ROLE',
  skip?: boolean
) => TContractReadResult & { roleHash: string } = (roleName, skip) => {
  const contractRead = usePompRead('Pomp', roleName, [], skip);
  return { ...contractRead, roleHash: contractRead.data as any };
};

export const useHasRoleQuery: (
  roleHash: string,
  address: string | undefined,
  skip?: boolean
) => TContractReadResult & { hasRole: boolean } = (roleHash, address, skip) => {
  const contractRead = usePompRead('Pomp', 'hasRole', [roleHash, address || ZERO_ADDRESS], skip);
  return { ...contractRead, hasRole: contractRead.data as any };
};

export const useMissionIdBySlug: (
  slug: string | null | undefined,
  skip?: boolean
) => TContractReadResult & { missionId: string | undefined } = (slug, skip) => {
  const contractRead = usePompRead(
    'Pomp',
    'missionIdBySlug',
    slug || '12345612312121', // arbitrary string
    skip,
    (data) => fromBNToHexString(data)
  );
  return { ...contractRead, missionId: contractRead.data as string | undefined };
};

export const useMissionByChallenge: (
  challenge: string,
  skip?: boolean
) => TContractReadResult & { mission: TMission | undefined } = (challenge, skip) => {
  const contractRead = usePompRead('Pomp', 'missionByChallenge', [challenge || ''], skip);
  const mission = contractRead?.data ? convertToTMission(contractRead.data) : undefined;
  return { ...contractRead, mission };
};

export const useMissionByIds: (
  ids:
    | {
        profileId: string;
        missionId: string;
      }[]
    | undefined,
  skip?: boolean
) => TContractReadResult & { missions: TMission[] | undefined } = (
  ids = [{ profileId: '0x00', missionId: '0x00' }],
  skip
) => {
  const { dev } = useAppContext();
  const contractReads = useContractReads({
    contracts: ids.map(({ profileId, missionId }) => ({
      ...pompContract,
      functionName: 'missionById',
      args: [profileId, missionId]
    })),
    enabled: !skip,
    onSuccess: (data) => dev && log('[useMissionByIds]', data),
    onError: (error) => elog('[useMissionByIds]', error)
  });
  const missions = contractReads?.data?.map((item) => convertToTMission(item));
  return { ...contractReads, missions };
};

export const useNftById: (
  tokenId: string,
  skip?: boolean
) => TContractReadResult & { tokenURI: string | undefined } = (tokenId, skip) => {
  const contractRead = usePompRead('Nft', 'tokenURI', tokenId || '0x00', skip);
  return { ...contractRead, tokenURI: contractRead.data as string | undefined };
};

export const useNftsByEnumerableIndexes: (
  address: string,
  enumerableIndexes: string[],
  skip?: boolean
) => TContractReadResult & { tokenURIs: any } = (address, enumerableIndexes, skip) => {
  const { dev } = useAppContext();
  const contracts = enumerableIndexes?.map((index) => ({
    ...nftContract,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, index]
  }));
  const contracRead = useContractReads({
    contracts: contracts ?? [],
    enabled: !skip,
    onSuccess: (data) => dev && log('[useNftsByEnumerableIndexes]', data),
    onError: (error) => elog('[useNftsByEnumerableIndexes]', error)
  });
  return { ...contracRead, tokenURIs: contracRead.data };
};

export const usePaginatedMissions: (
  profileId: string,
  start: number,
  perPage: number,
  skip?: boolean
) => ReturnType<typeof useContractInfiniteReads> & {
  pagesOfmissions: TMission[][] | null | undefined;
  pageParams: unknown[] | undefined;
} = (profileId, start, perPage, skip) => {
  const { dev } = useAppContext();
  const contractReads = useContractInfiniteReads<number>({
    cacheKey: `missionById_${profileId}`,
    ...paginatedIndexesConfig(
      (index) => ({
        ...pompContract,
        functionName: 'missionById',
        args: [profileId, index]
      }),
      { start, perPage, direction: 'decrement' }
    ),
    enabled: !skip,
    onSuccess: (data) => dev && log('[usePaginatedMissions]', data),
    onError: (error) => elog('[usePaginatedMissions]', error),
    allowFailure: true,
    select: (data) => ({
      pageParams: data.pageParams,
      pages: data.pages
        .filter((result) => !!result && !isEqual(result, [null]))
        .map((result) => result.filter?.((item) => !!item).map((item) => convertToTMission(item)))
    })
  });
  const pagesOfmissions = contractReads?.data?.pages as TMission[][] | null;

  return { ...contractReads, pagesOfmissions, pageParams: contractReads.data?.pageParams };
};

export const useProfileByAddress: (
  address: string | undefined | null,
  skip?: boolean
) => TContractReadResult & {
  profileId: string | null;
  profile: ProfileStruct | null;
  isCreator: boolean;
  isVerifier: boolean;
} = (address, skip) => {
  const contractRead = usePompRead(
    'Pomp',
    'profileByAddress',
    [address || ZERO_ADDRESS],
    skip,
    (data) => ({
      profileId: fromBNToHexString(data[0]),
      profile: data?.[1]
        ? {
            missionCount: BigNumber.from(data[1][0]).toNumber(),
            handle: data[1][1] as string,
            owner: data[1][2] as string
          }
        : null,
      isCreator: data?.[2],
      isVerifier: data?.[3]
    })
  );

  return {
    ...contractRead,
    profileId: contractRead?.data?.profileId,
    profile: contractRead?.data?.profile,
    isCreator: contractRead?.data?.isCreator,
    isVerifier: contractRead?.data?.isVerifier
  };
};

export const useProfileQuery: (
  profileId: any,
  skip?: boolean
) => TContractReadResult & { profile: ProfileStruct | null } = (profileId, skip) => {
  const contractRead = usePompRead('Pomp', 'profileById', profileId as string, skip);

  return {
    ...contractRead,
    profile: contractRead?.data
      ? <ProfileStruct>{
          missionCount: BigNumber.from(contractRead.data[0]).toNumber(),
          handle: contractRead.data[1] as string,
          owner: contractRead.data[2] as string
        }
      : null
  };
};

export const useProfileIdByHandleQuery: (
  handle: string,
  skip?: boolean
) => TContractReadResult & { profileId: string | null } = (handle, skip) => {
  const contractRead = usePompRead('Pomp', 'profileIdByHandle', [handle], skip, (data) =>
    fromBNToHexString(data)
  );
  return { ...contractRead, profileId: contractRead.data as any };
};
