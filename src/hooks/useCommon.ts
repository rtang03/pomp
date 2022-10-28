import { useAppContext } from '@components/AppContext';
import type { TransactionReceipt } from '@ethersproject/abstract-provider';
import { usePompPrepareWrite } from '@hooks/usePompOrNFTContract';
import { useState } from 'react';
import { useAccount, useContractWrite, useNetwork, useSignTypedData } from 'wagmi';

export const useCommon = (
  functionName:
    | 'createProfile'
    | 'startWithSig'
    | 'abortWithSig'
    | 'completeWithSig'
    | 'verifyWithSig'
    | 'failWithSig',
  args?: any
) => {
  const { dev, isValidWalletAccount } = useAppContext();
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const [txHash, setTxHash] = useState<string>();
  const { signTypedDataAsync, reset: signTypedDataAsynReset } = useSignTypedData();
  const { config } = usePompPrepareWrite(functionName, args, false);
  const { writeAsync, reset: writeAsyncReset } = useContractWrite(config);

  const resetAll = () => {
    setReceipt(undefined);
    setTxHash(undefined);
    signTypedDataAsynReset();
    writeAsyncReset();
  };

  return {
    isValidWalletAccount,
    dev,
    address,
    chain,
    receipt,
    setReceipt,
    txHash,
    setTxHash,
    signTypedDataAsync,
    writeAsync,
    resetAll
  };
};
