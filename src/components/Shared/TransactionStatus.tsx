import ViewAddressOnExplorer from '@components/Shared/ViewAddressOnExplorer';
import { type FC } from 'react';
import { LOCAL_CHAINID } from 'src/constants';
import { useNetwork } from 'wagmi';

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
