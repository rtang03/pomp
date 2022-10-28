import { useAppContext } from '@components/AppContext';
import { elog, log } from '@utils/consoleLog';
import { BigNumber } from 'ethers';
import { pompContract } from 'src/networks';
import { usePrepareContractWrite } from 'wagmi';

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
    overrides: { gasLimit: BigNumber.from(600000) },
    onSuccess: (data) => dev && log('[usePompPrepareWrite]', data),
    onError: (error) => elog('[usePompPrepareWrite]', error)
  });
};
