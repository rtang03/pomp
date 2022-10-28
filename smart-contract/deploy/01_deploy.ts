import { hexlify, keccak256 as keccak256Ethers, RLP } from 'ethers/lib/utils';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';
import type { DeployFunction } from 'hardhat-deploy/types';
import keccak256 from 'keccak256';
import { MerkleTree } from 'merkletreejs';

import { networkConfig } from '../helper-hardhat-config';
import { whitelistAccount } from '../utils';

const func: DeployFunction = async ({
  deployments,
  getNamedAccounts,
  getChainId,
  ethers,
  upgrades
}: HardhatRuntimeEnvironment) => {
  const { deploy, log, execute, read, fetchIfDifferent } = deployments;
  const { deployer, governor, testing_creator } = await getNamedAccounts();
  const chainId = await getChainId();

  // Whitelist
  const merkleTree = new MerkleTree(
    whitelistAccount.map((account) => keccak256(account)),
    keccak256,
    { sortPairs: true }
  );
  const rootHash = merkleTree.getHexRoot();

  // Here, we pre-compute the nonces and addresses used to deploy the contracts.
  // nonce + 1 is Logic library
  // nonce + 2 is mission NFT impl
  // nonce + 3 is profileModule
  // nonce + 4 is missionModule
  // nonce + 5 is impl
  // nonce + 6 is hub proxy

  let deployerNonce = await ethers.provider.getTransactionCount(deployer);

  // pre-compute hubProxyAddress
  const isLogic = await fetchIfDifferent('Logic', { from: deployer });
  const hubProxyNonce = hexlify(deployerNonce + (isLogic.differences ? 6 : 5));
  const hubProxyAddress = '0x' + keccak256Ethers(RLP.encode([deployer, hubProxyNonce])).substr(26);

  log('========= Deployment Started =========');
  log(`Deployer address: ${deployer}`);
  log(`MerkleTree root: ${rootHash}`);
  log('deployerNonce:', deployerNonce);

  log('------ Deploy Library ------');
  const LogicDeployment = await deploy('Logic', {
    nonce: isLogic.differences ? deployerNonce++ : deployerNonce,
    from: deployer,
    gasLimit: 5000000,
    log: true
  });
  const logicAddress = LogicDeployment.address;
  log(`You have deployed Logic contract to ${logicAddress}`);

  log('------ Deploy MissionNFT ------');
  const MissionNFTDeployment = await deploy('MissionNFT', {
    nonce: deployerNonce++,
    from: deployer,
    gasLimit: 5000000,
    log: true
  });
  const missionNFTAddress = MissionNFTDeployment.address;
  log(`You have deployed MissionNFT contract to ${missionNFTAddress}`);

  log('------ Deploy ProfileModule ------');
  const ProfileModuleDeployment = await deploy('ProfileModule', {
    nonce: deployerNonce++,
    from: deployer,
    gasLimit: 2500000,
    args: [hubProxyAddress, rootHash],
    log: true,
    libraries: { Logic: logicAddress }
  });
  const profileModuleAddress = ProfileModuleDeployment.address;
  log(`You have deployed ProfileModule contract to ${profileModuleAddress}`);

  log('------ Deploy MissionModule ------');
  const MissionModuleDeployment = await deploy('MissionModule', {
    nonce: deployerNonce++, // nonce + 4
    from: deployer,
    gasLimit: 5000000,
    args: [hubProxyAddress, missionNFTAddress],
    log: true,
    libraries: { Logic: logicAddress }
  });
  const missionModuleAddress = MissionModuleDeployment.address;
  log(`You have deployed MissionModule contract to ${missionModuleAddress}`);

  const accounts = await ethers.getSigners();
  const deployerAccount = accounts[0];
  const PompHubImplFactory = await ethers.getContractFactory('PompHub', {
    signer: deployerAccount
  });

  log('------ Deploy PompHub Impl ------');
  const pompHubImplAddress = await upgrades.deployImplementation(PompHubImplFactory, {
    kind: 'transparent'
  });
  log(`You have deployed PompHubImpl contract to ${pompHubImplAddress}`);

  log('------ Deploy PompHub Proxy ------');
  const pompHubProxy = await upgrades
    .deployProxy(PompHubImplFactory, [governor, profileModuleAddress, missionModuleAddress], {
      kind: 'transparent',
      useDeployedImplementation: true
    })
    .then((contract) => contract.deployed());
  const pompHubProxyAddress = pompHubProxy.address;
  log(`You have deployed PompHubProxy contract to ${pompHubProxyAddress}`);

  if (hubProxyAddress !== pompHubProxyAddress.toLowerCase())
    throw new Error('PompHubProxy address mismatched: Wrong nonce');

  log('------ Grant Minter Role ------');
  const minterRoleHash: string = await read('MissionNFT', { from: deployer }, 'MINTER_ROLE');
  log(`minterRoleHash: ${minterRoleHash}`);
  const creatorRoleHash = await pompHubProxy.CREATOR();
  log(`creatorRoleHash: ${creatorRoleHash}`);
  const verifierRoleHash: string = await pompHubProxy.VERIFIER();
  log(`verifierRoleHash: ${verifierRoleHash}`);

  await execute(
    'MissionNFT',
    { from: deployer },
    'grantRole',
    minterRoleHash,
    missionModuleAddress
  );
  log(`MissionModule ${missionModuleAddress} is the minter of MissionNFT`);

  log('------ Grant Creator Role ------');
  await pompHubProxy.connect(deployerAccount).grantRole(creatorRoleHash, deployer);
  log(`Deployer ${deployer} is the CREATOR (${creatorRoleHash}) of Pomp`);

  await pompHubProxy.connect(deployerAccount).grantRole(creatorRoleHash, testing_creator);
  log(`testing_creator ${testing_creator} is the CREATOR (${creatorRoleHash}) of PompHub`);

  log('------ Grant Verifier Role ------');
  await pompHubProxy.connect(deployerAccount).grantRole(verifierRoleHash, deployer);
  log(`Deployer ${deployer} is the VERIFIER (${verifierRoleHash}) of PompHub`);

  const networkName = networkConfig[chainId].name;
  log(`Verify Logic: \n npx hardhat verify --network ${networkName} ${logicAddress}`);
  log(`Verify MissionNFT: \n npx hardhat verify --network ${networkName} ${missionNFTAddress}`);
  log(
    `Verify MissionModule: \n npx hardhat verify --network ${networkName} ${missionModuleAddress} "${hubProxyAddress}" "${missionNFTAddress}"`
  );
  log(
    `Verify ProfileModule: \n npx hardhat verify --network ${networkName} ${profileModuleAddress} "${hubProxyAddress}" "${rootHash}"`
  );
  log(`Verify PompHubImpl: \n npx hardhat verify --network ${networkName} ${pompHubImplAddress}`);
  log(`Verify PompHubProxy: \n npx hardhat verify --network ${networkName} ${pompHubProxyAddress}`);
};

func.tags = ['pomp'];

export default func;
