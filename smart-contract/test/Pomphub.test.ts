import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import keccak256 from 'keccak256';
import { isEqual } from 'lodash';
import { MerkleTree } from 'merkletreejs';

import type { Logic, MissionModule, MissionNFT, ProfileModule } from '../typechain-types';
import {
  accountArray,
  buildAbortSignature,
  buildBatchVerifySignature,
  buildCompleteSignature,
  buildFailSignature,
  buildStartSignature,
  buildVerifySignature,
  computeContractAddress,
  deployer,
  deployerAddress,
  ERRORS,
  FIRST_MISSION_ID,
  FIRST_PROFILE_ID,
  FIRST_TOKEN_ID,
  governor,
  governorAddress,
  MOCK_URI,
  nonWhitelistedAccount,
  nonWhitelistedAddress,
  nonWhitelistedHash,
  prepareAccounts,
  userFour,
  userFourAddress,
  userFourHash,
  userThree,
  userThreeAddress,
  userThreeHash,
  userTwo,
  userTwoAddress,
  userTwoHash,
  verifier,
  verifierAddress,
  ZERO_ADDRESS
} from './__utils';

const merkleTree = new MerkleTree(
  accountArray.map((account) => keccak256(account)),
  keccak256,
  { sortPairs: true }
);
const rootHash = merkleTree.getHexRoot();

let pompHub: Contract;
let missionNFT: MissionNFT;
let missionModule: MissionModule;
let profileModule: ProfileModule;
let logic: Logic;
let chainId: number;
const slug = `slug${Math.floor(Math.random() * 10000)}`;
const minutesToExpire = 60; // One Hour
const deadline = Math.floor(Date.now() / 1000) + 60;
const challenge = 'CUZX5qE8Wvye6kS_SasIsa8MMxacJftmWdsIA_iKp3I';
const challenge_2 = '9rLddc0zMnW4ekKKqOoC1km6dr6KvGGM1FSUfQhtSMY';
const challenge_3 = 'rqemT_85Tq9bCDCo3RUbi-VR_oUKD61OI3UOf8EfSGY';
const fakedChallenge = challenge_3 + challenge_2 + challenge;
const batchVerifyWithSigCommonPayload = {
  profileIds: [1, 2, 3],
  challenges: challenge + challenge_2 + challenge_3
};
const challengeHash = keccak256(challenge);
const reason = 1;
let startWithSigCommonPayload: any;
let abortWithSigCommonPayload: any;
let completeWithSigCommonPayload: any;
let verifyWithSigCommonPayload: any;
let failWithSigCommonPayload: any;
let signatureCommonPayload: any;

describe('Pomp Upgradeable', () => {
  const deployFixture = async () => {
    await prepareAccounts();
    const logic = await ethers.getContractFactory('Logic').then((factory) => factory.deploy());
    startWithSigCommonPayload = {
      profileId: FIRST_PROFILE_ID,
      contentURI: MOCK_URI,
      slug,
      minutesToExpire,
      creator: userTwoAddress,
      verifier: verifierAddress
    };
    abortWithSigCommonPayload = {
      profileId: FIRST_PROFILE_ID,
      missionId: FIRST_MISSION_ID
    };
    completeWithSigCommonPayload = {
      profileId: FIRST_PROFILE_ID,
      missionId: FIRST_MISSION_ID,
      challenge
    };
    verifyWithSigCommonPayload = {
      profileId: FIRST_PROFILE_ID,
      challenge
    };
    failWithSigCommonPayload = { ...verifyWithSigCommonPayload, reason };

    // Here, we pre-compute the nonces and addresses used to deploy the contracts.
    const nonce = await deployer.getTransactionCount();
    // nonce + 1 is mission NFT impl
    // nonce + 2 is profileModule
    // nonce + 3 is missionModule
    // nonce + 4 is impl
    // nonce + 5 is hub proxy

    //'0x' + keccak256(RLP.encode([deployerAddress, hubProxyNonce])).substr(26);
    const hubProxyAddress = computeContractAddress(deployerAddress, nonce + 5);

    const missionNFT = await ethers
      .getContractFactory('MissionNFT', deployer)
      .then((factory) => factory.deploy());

    const profileModule = await ethers
      .getContractFactory('ProfileModule', {
        signer: deployer,
        libraries: { Logic: logic.address }
      })
      .then((factory) => factory.deploy(hubProxyAddress, rootHash));

    const missionModule = await ethers
      .getContractFactory('MissionModule', {
        signer: deployer,
        libraries: { Logic: logic.address }
      })
      .then((factory) => factory.deploy(hubProxyAddress, missionNFT.address));

    const PompHubImpl = await ethers.getContractFactory('PompHub', { signer: deployer });
    const pompHub = await upgrades
      .deployProxy(PompHubImpl, [governorAddress, profileModule.address, missionModule.address], {
        unsafeAllowLinkedLibraries: true,
        kind: 'transparent'
      })
      .then((contract) => contract.deployed());

    if (hubProxyAddress !== pompHub.address.toLowerCase())
      throw new Error('PompHubProxy address mismatched: Wrong nonce');

    // Grant Role
    await missionNFT
      .MINTER_ROLE()
      .then((hash) => missionNFT.connect(deployer).grantRole(hash, missionModule.address));
    await pompHub
      .CREATOR()
      .then((hash: string) => pompHub.connect(deployer).grantRole(hash, userTwoAddress));
    await pompHub
      .VERIFIER()
      .then((hash: string) => pompHub.connect(deployer).grantRole(hash, verifierAddress));

    const { chainId } = await ethers.provider.getNetwork();

    signatureCommonPayload = { chainId, signer: userTwo, contractAddress: missionModule.address };

    return { pompHub, logic, profileModule, missionNFT, missionModule, chainId };
  };

  describe('Deployment: Access Control', () => {
    before(async () => {
      ({ pompHub, missionNFT, missionModule, profileModule } = await loadFixture(deployFixture));
    });

    it('should setProfileModule', async () => {
      await expect(pompHub.connect(userTwo).setProfileModule(profileModule.address)).to.be.reverted;
      await expect(pompHub.connect(governor).pause()).not.to.be.reverted;
      await expect(pompHub.connect(governor).unpause()).not.to.be.reverted;
      await expect(pompHub.connect(deployer).setProfileModule(profileModule.address)).not.to.be
        .reverted;
    });

    it('should setMissionModule', async () => {
      await expect(pompHub.connect(deployer).setMissionModule(missionModule.address)).not.to.be
        .reverted;
      await expect(pompHub.connect(userTwo).setMissionModule(missionModule.address)).to.be.reverted;
    });

    it('should set role: MissionNFT', async () => {
      const minterRole = await missionNFT.MINTER_ROLE();
      expect(await missionNFT.hasRole(minterRole, missionModule.address)).to.true;
      expect(await missionNFT.hasRole(minterRole, deployerAddress)).to.true;
      expect(await missionNFT.hasRole(minterRole, userTwoAddress)).to.false;
    });

    it('should fail to mint by anonymous: MissionNFT', async () =>
      expect(missionNFT.connect(userTwo).safeMint(userTwoAddress, MOCK_URI, userTwoAddress, 0)).to
        .be.reverted);

    it('should set role: MissionModule', async () => {
      const hubRole = await missionModule.HUB_ROLE();
      expect(await missionModule.hasRole(hubRole, pompHub.address)).to.true;
      expect(await missionModule.hasRole(hubRole, userTwoAddress)).to.false;
    });

    it('should set role: ProfileModule', async () => {
      const hubRole = await profileModule.HUB_ROLE();
      expect(await profileModule.hasRole(hubRole, pompHub.address)).to.true;
      expect(await profileModule.hasRole(hubRole, userTwoAddress)).to.false;
    });

    it('should set role: PompHub', async () => {
      const governorRole = await pompHub.GOVERNOR_ROLE();
      expect(await pompHub.hasRole(governorRole, governorAddress)).to.true;
      expect(await pompHub.hasRole(governorRole, userTwoAddress)).to.false;
    });

    it('should fail to setMerklerootForProfiles: PompHub', async () => {
      await expect(pompHub.connect(deployer).setMerklerootForProfiles(rootHash)).not.to.be.reverted;
      await expect(pompHub.connect(userTwo).setMerklerootForProfiles(rootHash)).to.be.reverted;
      expect(await pompHub.connect(deployer).merkleroot()).to.equal(rootHash);
    });
  });

  describe('Create Profile', () => {
    before(async () => {
      ({ pompHub, logic, profileModule } = await loadFixture(deployFixture));
    });

    it('cannot claim profile: non-whitelist', async () => {
      const proof = merkleTree.getHexProof(nonWhitelistedHash);
      expect(isEqual(proof, [])).to.true;
      expect(await pompHub.canClaim(nonWhitelistedAddress, 'non_empty_handle', proof)).to.false;
    });

    it('can claim profile', async () =>
      expect(
        await pompHub.canClaim(
          userTwoAddress,
          'non_empty_handle',
          merkleTree.getHexProof(userTwoHash)
        )
      ).to.be.true);

    it('not claimed', async () => expect(await pompHub.claimed(userTwoAddress)).to.be.false);

    it('should fail to create profile: non-whitelist', async () =>
      expect(
        pompHub
          .connect(nonWhitelistedAccount)
          .createProfile('nonwhitelisted', merkleTree.getHexProof(nonWhitelistedHash))
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_WHITELISTED));

    it('should fail to create profile: invalid handle', async () =>
      expect(
        pompHub.connect(userTwo).createProfile('!mission-ok', merkleTree.getHexProof(userTwoHash))
      ).to.be.revertedWithCustomError(logic, ERRORS.CONTAINS_INVALID_CHARS));

    it('should fail to create profile: bypass PompHub', async () =>
      expect(
        profileModule
          .connect(userTwo)
          .createProfile('usertwohandle', userTwoAddress, merkleTree.getHexProof(userTwoHash))
      ).to.be.reverted);

    it('should create profile', async () =>
      expect(
        pompHub.connect(userTwo).createProfile('usertwohandle', merkleTree.getHexProof(userTwoHash))
      )
        .to.emit(profileModule, 'ProfileCreated')
        .withArgs(FIRST_PROFILE_ID, userTwoAddress, 'usertwohandle', anyValue));

    it('claimed', async () => expect(await pompHub.claimed(userTwoAddress)).to.be.true);

    it('cannot claim profile: repeated claim', async () =>
      expect(
        await pompHub
          .connect(userTwo)
          .canClaim(userTwoAddress, 'usertwohandle', merkleTree.getHexProof(userTwoHash))
      ).to.false);

    it('should fail to create profile by diff user using same handle', async () =>
      expect(
        pompHub
          .connect(userThree)
          .createProfile('usertwohandle', merkleTree.getHexProof(userThreeHash))
      ).to.be.revertedWithCustomError(logic, ERRORS.HANDLE_TAKEN));

    it('should query profile by profileId', async () => {
      const { handle, missionCount } = await pompHub.profileById(FIRST_PROFILE_ID);
      expect(handle).to.equal('usertwohandle');
      expect(missionCount).to.equal(0);
    });

    it('should query profile by Handle', async () => {
      const { handle, missionCount } = await pompHub.profileByHandle('usertwohandle');
      expect(handle).to.equal('usertwohandle');
      expect(missionCount).to.equal(0);
    });

    it('should query profileId by address', async () =>
      expect(await pompHub.profileIdByAddress(userTwoAddress)).to.equal(FIRST_PROFILE_ID));

    it('should query profileId by handle', async () =>
      expect(await pompHub.profileIdByHandle('usertwohandle')).to.equal(FIRST_PROFILE_ID));

    it('should getHandle', async () =>
      expect(await pompHub.getHandle(FIRST_PROFILE_ID)).to.equal('usertwohandle'));

    it('should profileIdCounter', async () => expect(await pompHub.profileIdCounter()).to.equal(2));
  });

  describe('should start → abort mission', () => {
    before(async () => {
      ({ pompHub, logic, missionNFT, profileModule, missionModule, chainId } = await loadFixture(
        deployFixture
      ));
    });

    it('should create first profile', async () =>
      expect(
        pompHub.connect(userTwo).createProfile('usertwohandle', merkleTree.getHexProof(userTwoHash))
      ).to.not.be.reverted);

    it('should fail to start mission: deadline expired', async () => {
      const deadline = Math.floor(Date.now() / 1000) - 10; // already expired
      await expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_EXPIRED);
    });

    it('should fail to start mission: deadline mismatched', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline: deadline + 500 // mismatched
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to start mission: invalid nonce', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber() + 1,
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to start mission: incorrect signer', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...startWithSigCommonPayload,
            chainId,
            signer: userThree, // incorrect signer. FIRST_PROFILE_ID is created by userTwo
            contractAddress: missionModule.address,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to start mission: mismatched profileId', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            profileId: 100, // <== the correct one should be FIRST_PROFILE_ID
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to start mission: not owner', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          profileId: 2, // <== does not exist
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            profileId: 2, // <== does not exist
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWith(ERRORS.NOT_OWNER));

    it('should fail to start mission: bypass PompHub', async () =>
      expect(
        missionModule.connect(userTwo).startWithSig(
          {
            ...startWithSigCommonPayload,
            signature: await buildStartSignature({
              ...signatureCommonPayload,
              ...startWithSigCommonPayload,
              nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
              deadline
            }),
            deadline
          },
          userTwoAddress
        )
      ).to.be.reverted);

    it('should start mission #1', async () => {
      await expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      )
        .to.emit(missionModule, 'Started')
        .withArgs(userTwoAddress, FIRST_PROFILE_ID, FIRST_MISSION_ID, anyValue, anyValue);
    });

    it('should fail to query mission by missionId: 0', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(FIRST_PROFILE_ID, 0);
      expect(mission.owner).to.equal(ZERO_ADDRESS);
      expect(mission.profileId).to.equal(0);
      expect(mission.tokenId).to.equal(0);
      expect(mission.state).to.equal(0);
      expect(missionId).to.equal(0);
      expect(tokenURI).to.equal('');
    });

    it('should query mission by missionId', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(FIRST_PROFILE_ID, 1);
      const { profileId, tokenId, verifier, state, owner, starttime, endtime, creator } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(tokenURI).to.equal(MOCK_URI);
      expect(endtime.sub(starttime).toNumber()).to.equal(3600); // One Hour
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(state).to.equal(0);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userTwoAddress);
      expect(creator).to.equal(userTwoAddress);
    });

    it('should query mission by slug', async () => {
      const { profileId, tokenId, verifier, owner, starttime, endtime, state, creator } =
        await pompHub.missionBySlug(FIRST_PROFILE_ID, slug);
      expect(endtime.sub(starttime).toNumber()).to.equal(3600); // One Hour
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(verifier).to.equal(verifierAddress);
      expect(state).to.equal(0);
      expect(owner).to.equal(userTwoAddress);
      expect(creator).to.equal(userTwoAddress);
    });

    it('should query missionId By slug', async () =>
      expect(await pompHub.missionIdBySlug(slug)).to.equal(FIRST_MISSION_ID));

    it('should query profile by address', async () => {
      const data = await pompHub.profileByAddress(userTwoAddress);
      expect(data[0]).to.equal(FIRST_PROFILE_ID);
      expect(data[1][0]).to.equal(1); // missionCount
      expect(data[1][1]).to.equal('usertwohandle');
      expect(data[1][2]).to.equal(userTwoAddress);
      expect(data[2]).to.true; // userTwo is Creator role
      expect(data[3]).to.false; // userTwo is not Verifier role
    });

    it('should mint missionNFT: tokenId = 1', async () => {
      expect(await missionNFT.ownerOf(FIRST_TOKEN_ID)).to.equal(missionModule.address);
      expect(await missionNFT.balanceOf(missionModule.address)).to.equal(1);
      expect(await missionNFT.tokenURI(FIRST_TOKEN_ID)).to.equal(MOCK_URI);
    });

    it('should create second profile', async () =>
      expect(
        pompHub
          .connect(userThree)
          .createProfile('userthreehandle', merkleTree.getHexProof(userThreeHash))
      ).to.not.be.reverted);

    it('should start mission #2; but fail to start #3 with same slug', async () => {
      await expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          slug: 'sameslug', // <== changed
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            slug: 'sameslug', // <== changed
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted;
      const deadline2 = Math.floor(Date.now() / 1000) + 60;
      await expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          slug: 'sameslug', // <== changed
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            slug: 'sameslug', // <== changed
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline: deadline2
          }),
          deadline: deadline2
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SLUG_TAKEN);
    });

    it('should fail to abort mission: not owner', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          profileId: 2, // <== INCORRECT_PROFILE,
          missionId: FIRST_MISSION_ID,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            profileId: 2, // <== INCORRECT_PROFILE
            missionId: FIRST_MISSION_ID,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWith(ERRORS.NOT_OWNER));

    it('should fail to abort mission: incorrect signer', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...abortWithSigCommonPayload,
            chainId,
            signer: userThree, // <== incorrect signer
            contractAddress: missionModule.address,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to abort mission: missionId does not exist', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          profileId: FIRST_PROFILE_ID,
          missionId: 100,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            profileId: FIRST_PROFILE_ID,
            missionId: 100, // <== does not exist
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_FOUND));

    it('should fail to abort mission: bypass PompHub', async () =>
      expect(
        missionModule.connect(userTwo).abortWithSig(
          {
            ...abortWithSigCommonPayload,
            signature: await buildAbortSignature({
              ...signatureCommonPayload,
              ...abortWithSigCommonPayload,
              nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
              deadline
            }),
            deadline
          },
          userTwoAddress
        )
      ).to.be.reverted);

    it('should abort mission', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      )
        .to.emit(missionModule, 'Aborted')
        .withArgs(FIRST_PROFILE_ID, FIRST_MISSION_ID, anyValue));

    it('aborted mission is burnt', async () => {
      await expect(missionNFT.ownerOf(FIRST_TOKEN_ID)).to.be.revertedWith(
        'ERC721: invalid token ID'
      );
      expect(await missionNFT.balanceOf(missionModule.address)).to.equal(1); // 2 missions created; 1 burnt
    });

    it('should fail to abort, after abort', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));
  });

  describe('should start → complete → verify mission', () => {
    before(async () => {
      ({ pompHub, logic, missionNFT, profileModule, missionModule, chainId } = await loadFixture(
        deployFixture
      ));
    });

    it('should create first profile', async () =>
      expect(
        pompHub.connect(userTwo).createProfile('usertwohandle', merkleTree.getHexProof(userTwoHash))
      ).to.not.be.reverted);

    it('should start mission', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted);

    it('should fail to complete mission: not owner', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          profileId: 2, // <== INCORRECT_PROFILE,
          signature: await buildCompleteSignature({
            ...signatureCommonPayload,
            ...completeWithSigCommonPayload,
            profileId: 2, // <== INCORRECT_PROFILE,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWith(ERRORS.NOT_OWNER));

    it('should fail to complete mission: incorrect signer', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...completeWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: userThree, // <== incorrect signer
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to complete: missionId does not exist', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          missionId: 100, // <== does not exist
          signature: await buildCompleteSignature({
            ...signatureCommonPayload,
            ...completeWithSigCommonPayload,
            missionId: 100, // <== does not exist
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_FOUND));

    it('should start second mission: minutesToExpire = 0', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          slug: 'slug2',
          minutesToExpire: 0,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            slug: 'slug2',
            minutesToExpire: 0,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted);

    it('should fail to complete: mission expired', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          missionId: 2, // <== second mission
          signature: await buildCompleteSignature({
            ...signatureCommonPayload,
            ...completeWithSigCommonPayload,
            missionId: 2, // <== second mission
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.EXPIRED));

    it('should fail to complete: bypass PompHub', async () =>
      expect(
        missionModule.connect(userTwo).completeWithSig(
          {
            ...completeWithSigCommonPayload,
            signature: await buildCompleteSignature({
              ...signatureCommonPayload,
              ...completeWithSigCommonPayload,
              nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
              deadline
            }),
            deadline
          },
          userTwoAddress
        )
      ).to.be.reverted);

    it('should fail to verify, before mission completed', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.revertedWithCustomError(logic, ERRORS.NOT_FOUND));

    it('should complete mission', async () => {
      const result = await pompHub.connect(userTwo).completeWithSig({
        ...completeWithSigCommonPayload,
        signature: await buildCompleteSignature({
          ...signatureCommonPayload,
          ...completeWithSigCommonPayload,
          nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait())
        .to.emit(missionModule, 'Completed')
        .withArgs(verifierAddress, FIRST_PROFILE_ID, FIRST_MISSION_ID, challengeHash, anyValue);
    });

    it('should query mission by missionId: Completed', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(FIRST_PROFILE_ID, 1);
      const { profileId, tokenId, verifier, state, owner, starttime, endtime } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(tokenURI).to.equal(MOCK_URI);
      expect(state).to.equal(2); // Completed
      expect(endtime.sub(starttime).toNumber()).to.equal(3600); // One Hour
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userTwoAddress);
    });

    it('should fail to abort, after completed', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to complete, after completed', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...signatureCommonPayload,
            ...completeWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to verify: mismatch profileId', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...signatureCommonPayload,
            signer: verifier, // <== use Verifier
            profileId: 100, // <== Invalid
            challenge,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to verify: userThree is NOT VERIFIER role', async () =>
      expect(
        pompHub.connect(userThree).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: userThree,
            nonce: (await pompHub.sigNonces(userThreeAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWith(ERRORS.DENIED));

    // userThree is Whitelisted but Faked Verifier; userThree is not verifier in MissionStruct
    it('should fail to verify: (whitelisted) faked verifier', async () => {
      await pompHub
        .VERIFIER()
        .then((hash: string) => pompHub.connect(deployer).grantRole(hash, userThreeAddress));

      await expect(
        pompHub.connect(userThree).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: userThree, // <== Whitelisted but Faked
            nonce: (await pompHub.sigNonces(userThreeAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_VERIFIER);
    });

    it('should fail to verify: invalid challenge', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          profileId: FIRST_PROFILE_ID,
          challenge: challenge_3, // <== INCORRECT
          signature: await buildVerifySignature({
            ...signatureCommonPayload,
            signer: verifier,
            profileId: FIRST_PROFILE_ID,
            challenge: challenge_3, // <== INCORRECT
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_FOUND));

    it('should fail to verify: invalid challenge format', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          profileId: FIRST_PROFILE_ID,
          challenge: 'IamNotCorrect', // <== INCORRECT. returns missionId = 0
          signature: await buildVerifySignature({
            ...signatureCommonPayload,
            signer: verifier,
            profileId: FIRST_PROFILE_ID,
            challenge: 'IamNotCorrect', // <== INCORRECT
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.INVALID_LENGTH));

    it('should fail to verify: invalid signer', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: userThree, // <== incorrect signer
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should fail to verify: invalid nonce', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber() + 1, // <== INCORRECT
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.SIGNATURE_INVALID));

    it('should query missionByChallenge', async () => {
      const [mission, missionId, tokenUri] = await pompHub.missionByChallenge(challenge);
      const { tokenId, verifier, state, owner } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(state).to.equal(2); // Completed
      expect(tokenUri).to.equal(MOCK_URI);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userTwoAddress);
    });

    it('should fail to verify: bypass PompHub', async () =>
      expect(
        missionModule.connect(verifier).verifyWithSig(
          {
            ...verifyWithSigCommonPayload,
            signature: await buildVerifySignature({
              ...verifyWithSigCommonPayload,
              ...signatureCommonPayload,
              signer: verifier,
              nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
              deadline
            }),
            deadline
          },
          verifierAddress
        )
      ).to.be.reverted);

    it('should verify with correct challenge', async () => {
      const result = await pompHub.connect(verifier).verifyWithSig({
        ...verifyWithSigCommonPayload,
        signature: await buildVerifySignature({
          ...verifyWithSigCommonPayload,
          ...signatureCommonPayload,
          signer: verifier,
          nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait())
        .to.emit(logic, 'Verified')
        .withArgs(verifierAddress, FIRST_PROFILE_ID, FIRST_MISSION_ID, challengeHash, anyValue);
    });

    it('should query mission after verfiy', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(
        FIRST_PROFILE_ID,
        FIRST_MISSION_ID
      );
      const { profileId, tokenId, verifier, state, owner } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(tokenURI).to.equal(MOCK_URI);
      expect(state).to.equal(3); // Verified
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userTwoAddress);
    });

    it('Transfer the missionNFT to userTwo, after verify', async () => {
      expect(await missionNFT.ownerOf(FIRST_TOKEN_ID)).to.equal(userTwoAddress);
      expect(await missionNFT.balanceOf(userTwoAddress)).to.equal(1);
      expect(await missionNFT.tokenURI(FIRST_TOKEN_ID)).to.equal(MOCK_URI);
    });

    it('should fail to abort, after verified', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to complete: after verified', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...completeWithSigCommonPayload,
            ...signatureCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to verify: after verified', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_VERIFIABLE));
  });

  describe('should start → complete → fail mission', () => {
    before(async () => {
      ({ pompHub, logic, missionNFT, profileModule, missionModule } = await loadFixture(
        deployFixture
      ));
    });

    it('should create first profile', async () =>
      expect(
        pompHub.connect(userTwo).createProfile('usertwohandle', merkleTree.getHexProof(userTwoHash))
      ).to.not.be.reverted);

    it('should start mission', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...startWithSigCommonPayload,
            ...signatureCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted);

    it('should complete mission', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...completeWithSigCommonPayload,
            ...signatureCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted);

    it('should fail to failMission: bypass PompHub', async () =>
      expect(
        missionModule.connect(verifier).failWithSig(
          {
            ...failWithSigCommonPayload,
            signature: await buildFailSignature({
              ...failWithSigCommonPayload,
              ...signatureCommonPayload,
              signer: verifier,
              nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
              deadline
            }),
            deadline
          },
          verifierAddress
        )
      ).to.be.reverted);

    it('should failMission with correct challenge', async () => {
      const result = await pompHub.connect(verifier).failWithSig({
        ...failWithSigCommonPayload,
        signature: await buildFailSignature({
          ...failWithSigCommonPayload,
          ...signatureCommonPayload,
          signer: verifier,
          nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait())
        .to.emit(logic, 'Failed')
        .withArgs(
          verifierAddress,
          FIRST_PROFILE_ID,
          FIRST_MISSION_ID,
          challengeHash,
          reason,
          anyValue
        );
    });

    it('should query mission after failMission', async () => {
      const [mission] = await pompHub.missionById(FIRST_PROFILE_ID, FIRST_MISSION_ID);
      const { profileId, tokenId, verifier, state, owner } = mission;
      expect(state).to.equal(4); // Failed
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userTwoAddress);
    });

    it('failed mission is burnt', async () => {
      await expect(missionNFT.ownerOf(FIRST_TOKEN_ID)).to.be.revertedWith(
        'ERC721: invalid token ID'
      );
      expect(await missionNFT.balanceOf(missionModule.address)).to.equal(0);
      expect(await missionNFT.balanceOf(userTwoAddress)).to.equal(0);
    });

    it('should fail to abort, after failMission', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to complete, after failMission', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...completeWithSigCommonPayload,
            ...signatureCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to verify, after failMission', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_VERIFIABLE));

    it('should fail to failMission, after failMission', async () =>
      expect(
        pompHub.connect(verifier).failWithSig({
          ...failWithSigCommonPayload,
          signature: await buildFailSignature({
            ...failWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_VERIFIABLE));
  });

  describe('should (start → complete) x 3 → batchVerify missions', () => {
    before(async () => {
      ({ pompHub, logic, missionNFT, profileModule, missionModule } = await loadFixture(
        deployFixture
      ));
    });

    it('should create first profile x 3', async () => {
      await expect(
        pompHub.connect(userTwo).createProfile('usertwohandle', merkleTree.getHexProof(userTwoHash))
      ).to.not.be.reverted;
      await expect(
        pompHub
          .connect(userThree)
          .createProfile('userthreehandle', merkleTree.getHexProof(userThreeHash))
      ).to.not.be.reverted;
      await expect(
        pompHub
          .connect(userFour)
          .createProfile('userfourhandle', merkleTree.getHexProof(userFourHash))
      ).to.not.be.reverted;
    });

    it('should start mission #1 by userTwo', async () =>
      expect(
        pompHub.connect(userTwo).startWithSig({
          ...startWithSigCommonPayload,
          signature: await buildStartSignature({
            ...signatureCommonPayload,
            ...startWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted);

    it('should start mission #2 by userThree', async () => {
      const commonPayload = {
        ...startWithSigCommonPayload,
        profileId: FIRST_PROFILE_ID + 1,
        slug: `slug${Math.floor(Math.random() * 10000)}`,
        creator: userThreeAddress
      };
      await expect(
        pompHub.connect(userThree).startWithSig({
          ...commonPayload,
          signature: await buildStartSignature({
            ...commonPayload,
            ...signatureCommonPayload,
            signer: userThree,
            nonce: (await pompHub.sigNonces(userThreeAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted;
    });

    it('should start mission #3 by userFour', async () => {
      const commonPayload = {
        ...startWithSigCommonPayload,
        profileId: FIRST_PROFILE_ID + 2,
        slug: `slug${Math.floor(Math.random() * 10000)}`,
        creator: userFourAddress
      };
      await expect(
        pompHub.connect(userFour).startWithSig({
          ...commonPayload,
          signature: await buildStartSignature({
            ...commonPayload,
            ...signatureCommonPayload,
            signer: userFour,
            nonce: (await pompHub.sigNonces(userFourAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).not.to.be.reverted;
    });

    it('should complete mission #1 by userTwo', async () => {
      const result = await pompHub.connect(userTwo).completeWithSig({
        ...completeWithSigCommonPayload,
        signature: await buildCompleteSignature({
          ...signatureCommonPayload,
          ...completeWithSigCommonPayload,
          nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait()).not.to.be.reverted;
    });

    it('should complete mission #2 by userThree', async () => {
      const commonPayload = {
        missionId: FIRST_MISSION_ID,
        profileId: FIRST_PROFILE_ID + 1,
        challenge: challenge_2
      };
      const result = await pompHub.connect(userThree).completeWithSig({
        ...commonPayload,
        signature: await buildCompleteSignature({
          ...commonPayload,
          ...signatureCommonPayload,
          signer: userThree,
          nonce: (await pompHub.sigNonces(userThreeAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait()).not.to.be.reverted;
    });

    it('should complete mission #3 by userFour', async () => {
      const commonPayload = {
        missionId: FIRST_MISSION_ID,
        profileId: FIRST_PROFILE_ID + 2,
        challenge: challenge_3
      };
      const result = await pompHub.connect(userFour).completeWithSig({
        ...commonPayload,
        signature: await buildCompleteSignature({
          ...commonPayload,
          ...signatureCommonPayload,
          signer: userFour,
          nonce: (await pompHub.sigNonces(userFourAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait()).not.to.be.reverted;
    });

    it('should fail to batch verify: too long challenges', async () =>
      expect(
        pompHub.connect(verifier).batchVerifyWithSig({
          ...batchVerifyWithSigCommonPayload,
          challenges: challenge + challenge_2 + challenge_3 + '123',
          signature: await buildBatchVerifySignature({
            ...signatureCommonPayload,
            ...batchVerifyWithSigCommonPayload,
            challenges: challenge + challenge_2 + challenge_3 + '123',
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.INVALID_LENGTH));

    it('should fail to batch verify: too short challenges', async () =>
      expect(
        pompHub.connect(verifier).batchVerifyWithSig({
          ...batchVerifyWithSigCommonPayload,
          challenges: challenge + challenge_2,
          signature: await buildBatchVerifySignature({
            ...signatureCommonPayload,
            ...batchVerifyWithSigCommonPayload,
            challenges: challenge + challenge_2,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.INVALID_LENGTH));

    it('should fail to batch verify: non-exist profileId', async () =>
      expect(
        pompHub.connect(verifier).batchVerifyWithSig({
          ...batchVerifyWithSigCommonPayload,
          profileIds: [100], // does not exist
          challenges: challenge,
          signature: await buildBatchVerifySignature({
            ...signatureCommonPayload,
            ...batchVerifyWithSigCommonPayload,
            profileIds: [100], // does not exist
            challenges: challenge,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.revertedWithCustomError(logic, ERRORS.NOT_FOUND));

    it('should fail to batch verify: not VERIFIER_ROLE', async () =>
      expect(
        pompHub.connect(userThree).batchVerifyWithSig({
          ...batchVerifyWithSigCommonPayload,
          signature: await buildBatchVerifySignature({
            ...signatureCommonPayload,
            ...batchVerifyWithSigCommonPayload,
            signer: userThree,
            nonce: (await pompHub.sigNonces(userThreeAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.revertedWith(ERRORS.DENIED));

    it('should fail to batch verify: faked challenges', async () =>
      expect(
        pompHub.connect(verifier).batchVerifyWithSig({
          ...batchVerifyWithSigCommonPayload,
          challenges: fakedChallenge,
          signature: await buildBatchVerifySignature({
            ...signatureCommonPayload,
            ...batchVerifyWithSigCommonPayload,
            challenges: fakedChallenge,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.revertedWithCustomError(logic, ERRORS.NOT_MATCHED));

    it('should batch verify: dryrun', async () =>
      expect(await pompHub.connect(verifier).canBatchVerify(batchVerifyWithSigCommonPayload)).to
        .true);

    it('should batch verify', async () => {
      const result = await pompHub.connect(verifier).batchVerifyWithSig({
        ...batchVerifyWithSigCommonPayload,
        signature: await buildBatchVerifySignature({
          ...batchVerifyWithSigCommonPayload,
          ...signatureCommonPayload,
          signer: verifier,
          nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
          deadline
        }),
        deadline
      });
      expect(await result.wait())
        .to.emit(logic, 'BatchVerified')
        .withArgs(verifierAddress, 3, anyValue);
    });

    it('should query mission #1 after batch verify', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(
        FIRST_PROFILE_ID,
        FIRST_MISSION_ID
      );
      const { profileId, tokenId, verifier, state, owner } = mission;
      expect(tokenURI).to.equal(MOCK_URI);
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(state).to.equal(3); // Verified
      expect(verifier).to.equal(verifierAddress);
      expect(profileId).to.equal(FIRST_PROFILE_ID);
      expect(tokenId).to.equal(FIRST_TOKEN_ID);
      expect(owner).to.equal(userTwoAddress);
    });

    it('should query mission #2 after batch verify', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(
        FIRST_PROFILE_ID + 1,
        FIRST_MISSION_ID
      );
      const { profileId, tokenId, verifier, state, owner } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(tokenURI).to.equal(MOCK_URI);
      expect(state).to.equal(3); // Verified
      expect(profileId).to.equal(FIRST_PROFILE_ID + 1);
      expect(tokenId).to.equal(FIRST_TOKEN_ID + 1);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userThreeAddress);
    });

    it('should query mission #3 after batch verify', async () => {
      const [mission, missionId, tokenURI] = await pompHub.missionById(
        FIRST_PROFILE_ID + 2,
        FIRST_MISSION_ID
      );
      const { profileId, tokenId, verifier, state, owner } = mission;
      expect(missionId).to.equal(FIRST_MISSION_ID);
      expect(tokenURI).to.equal(MOCK_URI);
      expect(state).to.equal(3); // Verified
      expect(profileId).to.equal(FIRST_PROFILE_ID + 2);
      expect(tokenId).to.equal(FIRST_TOKEN_ID + 2);
      expect(verifier).to.equal(verifierAddress);
      expect(owner).to.equal(userFourAddress);
    });

    it('Transfer the mission NFT #1 to userTwo, after verify', async () => {
      expect(await missionNFT.ownerOf(FIRST_TOKEN_ID)).to.equal(userTwoAddress);
      expect(await missionNFT.balanceOf(userTwoAddress)).to.equal(1);
      expect(await missionNFT.tokenURI(FIRST_TOKEN_ID)).to.equal(MOCK_URI);
    });

    it('Transfer the mission NFT #2 to userThree, after verify', async () => {
      expect(await missionNFT.ownerOf(FIRST_TOKEN_ID + 1)).to.equal(userThreeAddress);
      expect(await missionNFT.balanceOf(userThreeAddress)).to.equal(1);
      expect(await missionNFT.tokenURI(FIRST_TOKEN_ID + 1)).to.equal(MOCK_URI);
    });

    it('Transfer the mission NFT #3 to userFour, after verify', async () => {
      expect(await missionNFT.ownerOf(FIRST_TOKEN_ID + 2)).to.equal(userFourAddress);
      expect(await missionNFT.balanceOf(userFourAddress)).to.equal(1);
      expect(await missionNFT.tokenURI(FIRST_TOKEN_ID + 2)).to.equal(MOCK_URI);
    });

    it('should fail to abort mission #1, after verified', async () =>
      expect(
        pompHub.connect(userTwo).abortWithSig({
          ...abortWithSigCommonPayload,
          signature: await buildAbortSignature({
            ...signatureCommonPayload,
            ...abortWithSigCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to complete mission #1: after verified', async () =>
      expect(
        pompHub.connect(userTwo).completeWithSig({
          ...completeWithSigCommonPayload,
          signature: await buildCompleteSignature({
            ...completeWithSigCommonPayload,
            ...signatureCommonPayload,
            nonce: (await pompHub.sigNonces(userTwoAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_READY));

    it('should fail to verify mission #1: after verified', async () =>
      expect(
        pompHub.connect(verifier).verifyWithSig({
          ...verifyWithSigCommonPayload,
          signature: await buildVerifySignature({
            ...verifyWithSigCommonPayload,
            ...signatureCommonPayload,
            signer: verifier,
            nonce: (await pompHub.sigNonces(verifierAddress)).toNumber(),
            deadline
          }),
          deadline
        })
      ).to.be.revertedWithCustomError(logic, ERRORS.NOT_VERIFIABLE));
  });
});

export {};
