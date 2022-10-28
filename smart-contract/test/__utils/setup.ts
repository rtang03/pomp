import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumberish } from 'ethers';
import { hexlify, keccak256 as keccak256Ethers, RLP } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import keccak256 from 'keccak256';

export let accounts: SignerWithAddress[];
export let deployer: SignerWithAddress;
export let governor: SignerWithAddress;
export let user: SignerWithAddress;
export let userTwo: SignerWithAddress;
export let userThree: SignerWithAddress;
export let userFour: SignerWithAddress;
export let verifier: SignerWithAddress;
export let nonWhitelistedAccount: SignerWithAddress;
export let deployerAddress: string;
export let governorAddress: string;
export let userAddress: string;
export let userTwoAddress: string;
export let userThreeAddress: string;
export let userFourAddress: string;
export let verifierAddress: string;
export let nonWhitelistedAddress: string;
export let nonWhitelistedHash: Buffer;
export let userTwoHash: Buffer;
export let userThreeHash: Buffer;
export let userFourHash: Buffer;
export let verifierHash: Buffer;
export const MOCK_URI = 'https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR';

export const prepareAccounts = async () => {
  accounts = await ethers.getSigners();
  deployer = accounts[0];
  user = accounts[1];
  userTwo = accounts[2];
  userThree = accounts[3];
  userFour = accounts[4];
  verifier = accounts[8];
  nonWhitelistedAccount = accounts[9];
  deployerAddress = await deployer.getAddress();
  userAddress = await deployer.getAddress();
  userTwoAddress = await userTwo.getAddress();
  userThreeAddress = await userThree.getAddress();
  userFourAddress = await userFour.getAddress();
  verifierAddress = await verifier.getAddress();
  nonWhitelistedAddress = await nonWhitelistedAccount.getAddress();
  nonWhitelistedHash = keccak256(nonWhitelistedAddress);
  userTwoHash = keccak256(userTwoAddress);
  userThreeHash = keccak256(userThreeAddress);
  userFourHash = keccak256(userFourAddress);
  verifierHash = keccak256(verifierAddress);
  governorAddress = deployerAddress;
  governor = deployer;
};

const getDomain = (chainId: number, verifyingContract: string) => ({
  name: 'Pomp',
  version: '1',
  chainId,
  verifyingContract
});

export const buildStartSignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileId: BigNumberish;
  slug: string;
  contentURI: string;
  minutesToExpire: number;
  creator: string;
  verifier: string;
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileId,
  slug,
  contentURI,
  minutesToExpire,
  creator,
  verifier,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      Start: [
        { name: 'profileId', type: 'uint256' },
        { name: 'slug', type: 'string' },
        { name: 'contentURI', type: 'string' },
        { name: 'minutesToExpire', type: 'uint256' },
        { name: 'creator', type: 'address' },
        { name: 'verifier', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileId, slug, contentURI, minutesToExpire, creator, verifier, nonce, deadline }
  );

export const buildAbortSignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileId: BigNumberish;
  missionId: BigNumberish;
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileId,
  missionId,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      Abort: [
        { name: 'profileId', type: 'uint256' },
        { name: 'missionId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileId, missionId, nonce, deadline }
  );

export const buildCompleteSignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileId: BigNumberish;
  missionId: BigNumberish;
  challenge: string;
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileId,
  missionId,
  challenge,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      Complete: [
        { name: 'profileId', type: 'uint256' },
        { name: 'missionId', type: 'uint256' },
        { name: 'challenge', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileId, missionId, nonce, challenge, deadline }
  );

export const buildBatchVerifySignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileIds: BigNumberish[];
  challenges: string[];
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileIds,
  challenges,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      BatchVerify: [
        { name: 'profileIds', type: 'uint256[]' },
        { name: 'challenges', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileIds, nonce, challenges, deadline }
  );

export const buildVerifySignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileId: BigNumberish;
  challenge: string;
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileId,
  challenge,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      Verify: [
        { name: 'profileId', type: 'uint256' },
        { name: 'challenge', type: 'string' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileId, nonce, challenge, deadline }
  );

export const buildFailSignature: (args: {
  chainId: number;
  signer: SignerWithAddress;
  contractAddress: string;
  profileId: BigNumberish;
  challenge: string;
  reason: number;
  nonce: number;
  deadline: number;
}) => Promise<string> = async ({
  chainId,
  signer,
  contractAddress,
  profileId,
  challenge,
  reason,
  nonce,
  deadline
}) =>
  signer._signTypedData(
    getDomain(chainId, contractAddress),
    {
      Fail: [
        { name: 'profileId', type: 'uint256' },
        { name: 'challenge', type: 'string' },
        { name: 'reason', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    { profileId, reason, nonce, challenge, deadline }
  );

export function computeContractAddress(deployerAddress: string, nonce: number): string {
  const hexNonce = hexlify(nonce);
  return '0x' + keccak256Ethers(RLP.encode([deployerAddress, hexNonce])).substr(26);
}
