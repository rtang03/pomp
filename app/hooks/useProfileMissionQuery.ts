'use client';

import { BigNumber } from 'ethers';
import isEqual from 'lodash/isEqual';
import toast from 'react-hot-toast';
import {
  paginatedIndexesConfig,
  useContractInfiniteReads,
  useContractRead,
  useContractReads
} from 'wagmi';

import useAppContext from '@/Shared/AppContext';
import type { MissionStruct, ProfileStruct } from '@/types/PompContractStruct';
import { elog, log } from '@/utils/consoleLog';
import { ZERO_ADDRESS } from '@/utils/constants';
import { nftContract, pompContract } from '@/utils/networks';

export type TContractReadResult = ReturnType<typeof useContractRead>;
export type TMission = MissionStruct & { missionId: number; tokenURI: string };
export type TContractInfiniteReadsRefetch = ReturnType<typeof useContractInfiniteReads>['refetch'];
export type TAddress = `0x${string}`;

const fromBNToHexString = (input: BigNumber | undefined) => {
  const value = input !== undefined && input !== null ? BigNumber.from(input).toHexString() : null;
  return value === '0x00' ? null : value;
};

export const convertToTMission: (item: unknown) => TMission | null = (item) => {
  if (Array.isArray(item))
    return {
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
    };
  return null;
};

export const useClaimableByAddress = (address: TAddress, proof: TAddress[], skip?: boolean) => {
  const { dev } = useAppContext();
  const { data, error, isFetching, isError, isSuccess, refetch, isRefetching } = useContractReads({
    contracts: [
      { ...pompContract, functionName: 'claimed', args: [address] },
      { ...pompContract, functionName: 'profileIdByAddress', args: [address] },
      { ...pompContract, functionName: 'canClaim', args: [address, '00000000000', proof] },
      { ...pompContract, functionName: 'merkleroot', args: undefined }
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
) => TContractReadResult & { roleHash: TAddress | undefined } = (roleName, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: roleName,
    args: undefined,
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useRoleHashQuery]`, data),
    onError: (error) => {
      elog(`[useRoleHashQuery]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  return { ...contractRead, roleHash: contractRead.data };
};

export const useHasRoleQuery: (
  roleHash: TAddress,
  address: TAddress | undefined,
  skip?: boolean
) => TContractReadResult & { hasRole: boolean | undefined } = (roleHash, address, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'hasRole',
    args: [roleHash, address || ZERO_ADDRESS],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useHasRoleQuery]`, data),
    onError: (error) => {
      elog(`[useHasRoleQuery]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  return { ...contractRead, hasRole: contractRead.data };
};

export const useMissionIdBySlug: (
  slug: string | null | undefined,
  skip?: boolean
) => TContractReadResult & { missionId: string | null } = (slug, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'missionIdBySlug',
    args: [slug || '12345612312121'],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useMissionIdBySlug]`, data),
    onError: (error) => {
      elog(`[useMissionIdBySlug]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  return {
    ...contractRead,
    missionId: contractRead?.data ? fromBNToHexString(contractRead.data) : null
  };
};

export const useMissionByChallenge: (
  challenge: string,
  skip?: boolean
) => TContractReadResult & { mission: TMission | null } = (challenge, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'missionByChallenge',
    args: [challenge || ''],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useMissionByChallenge]`, data),
    onError: (error) => {
      elog(`[useMissionByChallenge]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  const mission = contractRead?.data ? convertToTMission(contractRead.data) : null;
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
) => TContractReadResult & { missions: (TMission | null)[] | undefined } = (
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
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...nftContract,
    functionName: 'tokenURI',
    args: [BigNumber.from(tokenId) || '0x00'],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useNftById]`, data),
    onError: (error) => {
      elog(`[useNftById]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  return { ...contractRead, tokenURI: contractRead.data };
};

export const useNftsByEnumerableIndexes: (
  address: string,
  enumerableIndexes: string[],
  skip?: boolean
) => TContractReadResult & { tokenURIs: string[] } = (address, enumerableIndexes, skip) => {
  const { dev } = useAppContext();
  const contracts = enumerableIndexes?.map((index) => ({
    ...nftContract,
    functionName: 'tokenOfOwnerByIndex',
    args: [address, index]
  }));
  const contracRead = useContractReads({
    contracts,
    enabled: !skip,
    onSuccess: (data) => dev && log('[useNftsByEnumerableIndexes]', data),
    onError: (error) => elog('[useNftsByEnumerableIndexes]', error)
  });
  return { ...contracRead, tokenURIs: contracRead.data as any };
};

export const usePaginatedMissions = (
  profileId: string,
  start: number,
  perPage: number,
  skip?: boolean
) => {
  const { dev } = useAppContext();
  const contractReads = useContractInfiniteReads({
    cacheKey: `missionById_${profileId}`,
    ...paginatedIndexesConfig(
      (index) => [
        {
          ...pompContract,
          functionName: 'missionById',
          args: [BigNumber.from(profileId), BigNumber.from(index)] as [BigNumber, BigNumber]
        }
      ],
      { start, perPage, direction: 'decrement' }
    ),
    enabled: !skip,
    onSuccess: (data) => dev && log('[usePaginatedMissions]', data),
    onError: (error) => elog('[usePaginatedMissions]', error),
    allowFailure: true
  });
  const pagesOfmissions = contractReads?.data
    ? contractReads.data.pages
        .filter((result) => !!result && !isEqual(result, [null]))
        .map((result) => result.filter?.((item) => !!item).map((item) => convertToTMission(item)))
    : null;

  return { ...contractReads, pagesOfmissions, pageParams: contractReads.data?.pageParams };
};

export const useProfileByAddress: (
  address: TAddress | undefined | null,
  skip?: boolean
) => TContractReadResult & {
  profileId: string | null;
  profile: ProfileStruct | null;
  isCreator: boolean | undefined;
  isVerifier: boolean | undefined;
} = (address, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'profileByAddress',
    args: [address || ZERO_ADDRESS],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useProfileByAddress]`, data),
    onError: (error) => {
      elog(`[useProfileByAddress]`, error);
      toast.error('Fail to fetch contract');
    }
  });

  return {
    ...contractRead,
    profileId: contractRead?.data ? fromBNToHexString(contractRead.data[0]) : null,
    profile: contractRead?.data?.[1]
      ? {
          missionCount: BigNumber.from(contractRead.data[1].missionCount).toNumber(),
          handle: contractRead.data[1].handle,
          owner: contractRead.data[1].owner
        }
      : null,
    isCreator: contractRead?.data?.[2],
    isVerifier: contractRead?.data?.[3]
  };
};

export const useProfileQuery: (
  profileId: any,
  skip?: boolean
) => TContractReadResult & { profile: ProfileStruct | null } = (profileId, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'profileById',
    args: [profileId],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useProfileQuery]`, data),
    onError: (error) => {
      elog(`[useProfileQuery]`, error);
      toast.error('Fail to fetch contract');
    }
  });

  return {
    ...contractRead,
    profile: contractRead?.data
      ? {
          missionCount: BigNumber.from(contractRead.data.missionCount).toNumber(),
          handle: contractRead.data.handle as string,
          owner: contractRead.data.owner as string
        }
      : null
  };
};

export const useProfileIdByHandleQuery: (
  handle: string,
  skip?: boolean
) => TContractReadResult & { profileId: string | null } = (handle, skip) => {
  const { dev } = useAppContext();
  const contractRead = useContractRead({
    ...pompContract,
    functionName: 'profileIdByHandle',
    args: [handle],
    enabled: !skip,
    onSuccess: (data) => dev && log(`[useProfileIdByHandleQuery]`, data),
    onError: (error) => {
      elog(`[useProfileIdByHandleQuery]`, error);
      toast.error('Fail to fetch contract');
    }
  });
  return {
    ...contractRead,
    profileId: contractRead.data ? fromBNToHexString(contractRead.data) : null
  };
};
