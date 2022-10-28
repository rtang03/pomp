import { useAppContext } from '@components/AppContext';
import { elog, log } from '@utils/consoleLog';
import type { Result } from 'ethers/lib/utils';
import toast from 'react-hot-toast';
import { nftContract, pompContract } from 'src/networks';
import { useContractRead, usePrepareContractWrite } from 'wagmi';

export const usePompRead = (
  kind: 'Pomp' | 'Nft',
  functionName:
    | 'hasRole'
    | 'missionIdBySlug'
    | 'profileByAddress'
    | 'profileIdByHandle'
    | 'profileById'
    | 'CREATOR'
    | 'VERIFIER'
    | 'PAUSER_ROLE'
    | 'tokenURI'
    | 'ownerOf'
    | 'balanceOf'
    | 'tokenOfOwnerByIndex'
    | 'missionByChallenge',
  args: string | string[],
  skip?: boolean,
  select?: ((data: Result) => any) | undefined
) => {
  const { dev } = useAppContext();
  const contract = kind === 'Pomp' ? pompContract : nftContract;
  return useContractRead({
    ...contract,
    functionName,
    args,
    enabled: !skip,
    select,
    onSuccess: (data) => dev && log(`[use${kind}Read]`, data),
    onError: (error) => {
      elog(`[use${kind}Read]`, error);
      toast.error('Fail to fetch contract');
    }
  });
};

export const usePompPrepareWrite = (
  functionName:
    | 'createProfile'
    | 'startWithSig'
    | 'abortWithSig'
    | 'completeWithSig'
    | 'verifyWithSig'
    | 'failWithSig'
    | 'grantRole'
    | 'revokeRole',
  args: any,
  skip?: boolean
) => {
  const { dev } = useAppContext();
  return usePrepareContractWrite({
    ...pompContract,
    functionName,
    args,
    enabled: !skip,
    overrides: { gasLimit: 600000 },
    onSuccess: (data) => dev && log('[usePompPrepareWrite]', data),
    onError: (error) => elog('[usePompPrepareWrite]', error)
  });
};
