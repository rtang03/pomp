export const networkConfigs = {
  ['mumbai' as string]: {
    chainId: `0x${Number(80001).toString(16)}`,
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://rpc-mumbai.matic.today/'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com/']
  },
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: 'Binance Smart Chain Mainnet',
    nativeCurrency: {
      name: 'Binance Chain Native Token',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org',
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed2.defibit.io',
      'https://bsc-dataseed3.defibit.io',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed1.ninicoin.io',
      'https://bsc-dataseed2.ninicoin.io',
      'https://bsc-dataseed3.ninicoin.io',
      'https://bsc-dataseed4.ninicoin.io',
      'wss://bsc-ws-node.nariox.org'
    ],
    blockExplorerUrls: ['https://bscscan.com']
  },
  avalanche: {
    chainId: `0x${Number(43114).toString(16)}`,
    chainName: 'Avalanche Mainnet',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://cchain.explorer.avax.network/']
  },
  '1': {
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://etherscan.io/',
    wrapped: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  },
  '5': {
    chainName: 'Goerli',
    currencyName: 'ETH',
    currencySymbol: 'ETH',
    blockExplorerUrl: 'https://goerli.etherscan.io/'
  },
  '1337': {
    chainName: 'Local Chain',
    currencyName: 'ETH',
    currencySymbol: 'ETH',
    rpcUrl: 'http://127.0.0.1:8545'
  },
  '56': {
    chainId: 56,
    chainName: 'Smart Chain',
    currencyName: 'BNB',
    currencySymbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    blockExplorerUrl: 'https://bscscan.com/',
    wrapped: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
  },
  '97': {
    chainId: 97,
    chainName: 'Smart Chain - Testnet',
    currencyName: 'BNB',
    currencySymbol: 'BNB',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    blockExplorerUrl: 'https://testnet.bscscan.com/'
  },
  '137': {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    currencyName: 'MATIC',
    currencySymbol: 'MATIC',
    rpcUrl: 'https://rpc-mainnet.maticvigil.com/',
    blockExplorerUrl: 'https://explorer-mainnet.maticvigil.com/',
    wrapped: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
  },
  '80001': {
    chainId: 80001,
    chainName: 'Mumbai',
    currencyName: 'MATIC',
    currencySymbol: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.matic.today/',
    blockExplorerUrl: 'https://mumbai.polygonscan.com/'
  }
};

export const getNativeByChain = (chain: string) =>
  networkConfigs[chain]?.currencySymbol || 'NATIVE';

export const getChainById = (chain: string) => networkConfigs[chain]?.chainId || null;

export const getExplorer = (chain: string) => networkConfigs[chain]?.blockExplorerUrl;

export const getChainName = (chain: string) => networkConfigs[chain]?.chainName;

export const getWrappedNative = (chain: string) => networkConfigs[chain]?.wrapped || null;
