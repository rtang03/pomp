import { utils } from 'ethers';

export const POMP_ADDRESS_LOCAL = '0x0165878A594ca255338adfa4d48449f69242Eb8F';
export const POMP_ADDRESS_GOERLI = '0xB2F669cca65cA0c3e70364A07c311Aa86fc030a5';
export const POMP_ADDRESS_MUMBAI = '0x32C1c9547EBcD3C450bc73C88c1679F56db513FE';

// for use in event filter
export const MISS_MODULE_ADDRESS_LOCAL = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
export const MISS_MODULE_ADDRESS_GOERLI = '0x78D9281b576a1e0c5C78D211c77B167982665785';
export const MISS_MODULE_ADDRESS_MUMBAI = '0x025c3382BE9424668cA13245dE1D70Bdd2646318';
export const MISSIONNFT_ADDRESS_LOCAL = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
export const MISSIONNFT_ADDRESS_GOERLI = '0xafEC3b28bf567fb768B71586EA72541781Bd3c13';
export const MISSIONNFT_ADDRESS_MUMBAI = '0xffcb591E32524e48775751b6B73c1D88E6A043ea';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
// any valid signature
export const SIGNATURE_PLACEHOLDER =
  '0xad866d617b81a9e801a10e3a2660957cd19392f0dbe59f2b9014afb8be23f41274d116abff7dd4c4a5d670378aa83e54dec58dc13397a8bfd5015dd847bce5621b';
export const ADDRESS_LENGTH = 42;
export const supportedChainIds = [5, 1337, 80001]; // add 1, 137
export const LOCAL_CHAINID = 1337;
export const APP_URL = 'mission-web3.vercel.app';
export const IPFS_DEDICATED_GATEWAY = 'https://madseed.infura-ipfs.io/ipfs';
export const CONFIRMATION_TIMES = 1;
export const MIN_CHALLENGE_LENGTH = 43;
export const PAGESIZE = 5;
export const STARTED_EVENT = utils.id(
  'Started(uint256,uint256,uint256,string,string,uint256,uint256)'
);
export enum STATUS {
  OK = 'done',
  ERR = 'error',
  WAITING = 'waiting',
  SENDING = 'sending',
  UPLOADING = 'uploading',
  SIGNING = 'signing',
  IDLE = 'idle',
  PREPARING = 'preparing'
}
export const OG_URL = process.env.VERCEL_URL
  ? 'https://' + process.env.VERCEL_URL
  : 'https://mission-web3.vercel.app';
export const OG_DESCRIPTION = `Prove your mission achievement; built with Pomp protocol. You can compose, play and verifiy mission; producing mission NFT.`;
export const BRAND_IMAGE = `${
  process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : ''
}/api/logo`;
export const OOPS = 'Opps! Something bad happens';

export {};
