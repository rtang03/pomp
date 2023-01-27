'use client';

import { type FC } from 'react';
import { useNetwork } from 'wagmi';

import ViewAddressOnExplorer from '@/Shared/ViewAddressOnExplorer';
import { LOCAL_CHAINID } from '@/utils/constants';

const TransactionStatus: FC<{ status?: any; txHash: string | undefined }> = ({
  status,
  txHash
}) => {
  const { chain } = useNetwork();

  return (
    <>
      {status && <div>status: {status}</div>}
      {txHash && chain && chain.id !== LOCAL_CHAINID && (
        <div className="my-10 flex items-center space-x-2">
          <div>View Transaction</div>
          <ViewAddressOnExplorer hash={txHash} />
        </div>
      )}
    </>
  );
};

export default TransactionStatus;
