import { usePaginatedMissions, useProfileByAddress } from '@hooks/useProfileMissionQuery';
import flatten from 'lodash/flatten';
import { PAGESIZE } from 'src/constants';
import { useAccount } from 'wagmi';

export const useMissionsByAddress = () => {
  const { address } = useAccount();
  const {
    profileId,
    profile,
    isCreator,
    isVerifier,
    isError: isErrorProfileByAddress,
    isFetching: profileFetching
  } = useProfileByAddress(address, !address);
  const missionCount = profileId && profile ? profile.missionCount : 0;
  const {
    pagesOfmissions,
    hasNextPage,
    fetchNextPage,
    isFetching: missionFetching,
    isRefetching: missionRefetching,
    refetch
  } = usePaginatedMissions(
    profileId as string,
    missionCount,
    PAGESIZE,
    !profileId || missionCount === 0
  );
  const isLoading = profileFetching || missionFetching || missionRefetching;

  // Hack: when missionCount 0, allow to fetch; but because solidity is not nullable. It
  // will return non-empty null record. If skipping when missionCount 0, wagmi use react-query
  // the useContractReads may return incorrect cache data. So allpages will return [] in here,
  // when missionCount 0.
  const allPages =
    missionCount === 0
      ? []
      : pagesOfmissions
      ? flatten(pagesOfmissions).filter((m) => m?.missionId !== 0)
      : [];

  return {
    isCreator,
    isVerifier,
    profileId,
    profile,
    isLoading,
    allPages,
    isErrorProfileByAddress,
    hasNextPage,
    fetchNextPage,
    refetch
  };
};
