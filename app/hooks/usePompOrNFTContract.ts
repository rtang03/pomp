'use client';

import { BigNumber } from 'ethers';
import { usePrepareContractWrite } from 'wagmi';

import useAppContext from '@/Shared/AppContext';
import { elog, log } from '@/utils/consoleLog';
import { pompContract } from '@/utils/networks';

const usePompPrepareWrite = (
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
    overrides: { gasLimit: BigNumber.from(600000) },
    onSuccess: (data) => dev && log('[usePompPrepareWrite]', data),
    onError: (error) => elog('[usePompPrepareWrite]', error)
  });
};

export default usePompPrepareWrite;
