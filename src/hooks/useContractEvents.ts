import { useAppContext } from '@components/AppContext';
import { elog } from '@utils/consoleLog';
import { ethers, utils } from 'ethers';
import { useEffect, useState } from 'react';
import missionABI from 'smart-contract/abi/contracts/MissionModule.sol/MissionModule.json';
import { MISSION_MODULE_ADDRESS } from 'src/networks';
import { useAccount, useSigner } from 'wagmi';

export type ParsedEvent = { profileId: string; missionId: string };

export const useContractEvents = (kind: 'Started' | 'Completed') => {
  const { dev } = useAppContext();
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [contractEvents, setContractEvents] = useState<ParsedEvent[]>();
  const [error, setError] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>();

  useEffect(() => {
    if (!contractEvents && signer) {
      const decodeUint256 = (input: any) =>
        utils.defaultAbiCoder.decode(['uint256'], input)[0].toHexString();
      setIsLoading(true);
      try {
        const contract = new ethers.Contract(MISSION_MODULE_ADDRESS, missionABI, signer);
        contract.queryFilter(contract.filters[kind](address, null, null)).then((events) => {
          setContractEvents(
            events.map(({ topics }) => ({
              profileId: decodeUint256(topics[2]),
              missionId: decodeUint256(topics[3])
            }))
          );
          setIsLoading(false);
        });
      } catch (err) {
        dev && elog('[useContractEvents]', err);
        setError(err);
        setIsLoading(false);
      }
    }
  }, [address, contractEvents, dev, kind, signer]);

  return { contractEvents, error, isLoading };
};
