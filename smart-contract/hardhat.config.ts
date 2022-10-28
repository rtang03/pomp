import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-spdx-license-identifier';
import 'hardhat-abi-exporter';
import '@openzeppelin/hardhat-upgrades';

import dotenv from 'dotenv';
import { type HardhatUserConfig, task } from 'hardhat/config';

dotenv.config({ path: './.env' });

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || process.env.ALCHEMY_MAINNET_RPC_URL;
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL;
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL;
const MNEMONIC = process.env.MNEMONIC || 'your mnemonic';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const POLYSCAN_API_KEY = process.env.POLYSCAN_API_KEY;

// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: 0,
    governor: 0,
    testing_creator: '0xc93b8F86c949962f3B6D01C4cdB5fC4663b1af0A'
  },
  networks: {
    hardhat: {
      live: true,
      saveDeployments: true,
      tags: ['Pomp'],
      chainId: 1337
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: { mnemonic: MNEMONIC, initialIndex: 0, count: 10 },
      saveDeployments: true
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: { mnemonic: MNEMONIC, initialIndex: 0, count: 10 },
      saveDeployments: true
    },
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: { mnemonic: MNEMONIC },
      saveDeployments: true
    },
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: { mnemonic: MNEMONIC },
      saveDeployments: true
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD'
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY || '',
      rinkeby: ETHERSCAN_API_KEY || '',
      goerli: ETHERSCAN_API_KEY || '',
      polygon: POLYSCAN_API_KEY || '',
      polygonMumbai: POLYSCAN_API_KEY || ''
    }
  },
  solidity: {
    settings: {
      evmVersion: 'istanbul',
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
    compilers: [{ version: '0.8.16' }]
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 40000
  },
  abiExporter: {
    path: './abi',
    clear: true,
    flat: false,
    only: ['PompHub', 'MissionNFT', 'ProfileModule', 'MissionModule'],
    spacing: 2,
    runOnCompile: true
  }
};

export default config;
