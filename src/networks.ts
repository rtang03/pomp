import nftABI from 'smart-contract/abi/contracts/MissionNFT.sol/MissionNFT.json';
import pompABI from 'smart-contract/abi/contracts/PompHub.sol/PompHub.json';

import {
  MISS_MODULE_ADDRESS_GOERLI,
  MISS_MODULE_ADDRESS_LOCAL,
  MISS_MODULE_ADDRESS_MUMBAI,
  MISSIONNFT_ADDRESS_GOERLI,
  MISSIONNFT_ADDRESS_LOCAL,
  MISSIONNFT_ADDRESS_MUMBAI,
  POMP_ADDRESS_GOERLI,
  POMP_ADDRESS_LOCAL,
  POMP_ADDRESS_MUMBAI
} from './constants';

const defaultNetworkForPomp =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mumbai' ? POMP_ADDRESS_MUMBAI : POMP_ADDRESS_GOERLI;

const IS_LOCALHOST =
  process.env.IS_LOCALHOST === 'true' || process.env.NEXT_PUBLIC_IS_LOCALHOST === 'true';
export const POMP_ADDRESS = IS_LOCALHOST ? POMP_ADDRESS_LOCAL : defaultNetworkForPomp;

export const pompContract = {
  addressOrName: POMP_ADDRESS,
  contractInterface: pompABI
};

const defaultNetworkForNft =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mumbai'
    ? MISSIONNFT_ADDRESS_MUMBAI
    : MISSIONNFT_ADDRESS_GOERLI;

export const nftContract = {
  addressOrName: IS_LOCALHOST ? MISSIONNFT_ADDRESS_LOCAL : defaultNetworkForNft,
  contractInterface: nftABI
};

const defaultNetworkForMissionModule =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mumbai'
    ? MISS_MODULE_ADDRESS_MUMBAI
    : MISS_MODULE_ADDRESS_GOERLI;

export const MISSION_MODULE_ADDRESS = IS_LOCALHOST
  ? MISS_MODULE_ADDRESS_LOCAL
  : defaultNetworkForMissionModule;

export {};
