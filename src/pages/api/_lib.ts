import { BigNumber, ethers } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import pompABI from 'smart-contract/abi/contracts/PompHub.sol/PompHub.json';
import {
  MISS_MODULE_ADDRESS_GOERLI,
  MISS_MODULE_ADDRESS_LOCAL,
  MISS_MODULE_ADDRESS_MUMBAI,
  POMP_ADDRESS_GOERLI,
  POMP_ADDRESS_LOCAL,
  POMP_ADDRESS_MUMBAI
} from 'src/constants';

const IS_MUMBAI = process.env.DEFAULT_NETWORK === 'mumbai';
const POMP_ADDRESS =
  process.env.DEFAULT_NETWORK === 'mumbai' ? POMP_ADDRESS_MUMBAI : POMP_ADDRESS_GOERLI;
const MISSION_MODULE_ADDRESS =
  process.env.DEFAULT_NETWORK === 'mumbai'
    ? MISS_MODULE_ADDRESS_MUMBAI
    : MISS_MODULE_ADDRESS_GOERLI;
const DEADLINE = 300; // 5 minutes

export const requirePostMethod = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export const getDomainSeparator = async (isLocalhost: boolean | undefined) => {
  const provider = isLocalhost
    ? new ethers.providers.JsonRpcProvider()
    : IS_MUMBAI
    ? new ethers.providers.AlchemyProvider(80001, process.env.ALCHEMY_MUMBAI)
    : new ethers.providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI);
  const missionModuleAddress = isLocalhost ? MISS_MODULE_ADDRESS_LOCAL : MISSION_MODULE_ADDRESS;

  return {
    name: 'Pomp',
    version: '1',
    chainId: (await provider.getNetwork()).chainId,
    verifyingContract: missionModuleAddress
  };
};

export const getSigNonce = async (address: string, isLocalhost: boolean | undefined) => {
  const provider = isLocalhost
    ? new ethers.providers.JsonRpcProvider()
    : IS_MUMBAI
    ? new ethers.providers.AlchemyProvider(80001, process.env.ALCHEMY_MUMBAI)
    : new ethers.providers.AlchemyProvider(5, process.env.ALCHEMY_GOERLI);
  const pompAddress = isLocalhost ? POMP_ADDRESS_LOCAL : POMP_ADDRESS;
  const pompContract = new ethers.Contract(pompAddress, pompABI, provider);
  return pompContract.sigNonces(address).then((_nonce: any) => BigNumber.from(_nonce).toNumber());
};

export const getDeadline = () => Math.floor(Date.now() / 1000) + DEADLINE;

export {};
