import { useAppContext } from '@components/AppContext';
import { useClaimableByAddress } from '@hooks/useProfileMissionQuery';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export const useCanClaim = () => {
  const { isAuthenticated, isValidWalletAccount } = useAppContext();
  const { address } = useAccount();

  // Retrieve Merkle proof and rootHash from NextAPI
  const [merkle, setMerkle] = useState<any>();
  const notWhitelistProfile = merkle?.verified === false;
  useEffect(() => {
    address &&
      fetch(`/api/${address}/whitelist`)
        .then((res) => res.json())
        .then((json) => setMerkle(json));
  }, [address]);

  // check claimability
  const { canClaim, merkleroot, canClaimError, profileId, refetch } = useClaimableByAddress(
    address as string,
    merkle?.proof,
    !isAuthenticated || !isValidWalletAccount || !merkle
  );

  // Extra guard to ensure rootHash in NextApi, the same as on-chain root hash
  // this error may come from manual misconfiguration
  const isRoothashOutOfSync = merkle ? merkle.rootHash !== merkleroot : null;

  return {
    notWhitelistProfile,
    isRoothashOutOfSync,
    canClaim,
    merkle,
    canClaimError,
    profileId,
    isValidWalletAccount,
    refetch
  };
};
