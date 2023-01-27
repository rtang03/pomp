'use client';

import { chain, configureChains, createClient } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const IS_LOCALHOST = process.env.NEXT_PUBLIC_IS_LOCALHOST === 'true';
const ALCHEMY_API_KEY =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === 'mumbai'
    ? process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    : process.env.NEXT_PUBLIC_ALCHEMY_GOERLI;

let client: any;

export const getClient = () => {
  if (!client) {
    const { chains, provider, webSocketProvider } = configureChains(
      IS_LOCALHOST
        ? [chain.localhost]
        : [
            chain.polygon,
            chain.polygonMumbai,
            chain.mainnet,
            // chain.hardhat,
            chain.goerli
          ],
      IS_LOCALHOST
        ? [
            jsonRpcProvider({
              rpc: (chain) => ({
                http: `http://localhost:8545`
              }),
              priority: 2
            })
          ]
        : [alchemyProvider({ priority: 1, apiKey: ALCHEMY_API_KEY })]
    );
    client = createClient({
      provider,
      webSocketProvider,
      autoConnect: true,
      connectors: [
        new MetaMaskConnector({ chains }),
        new WalletConnectConnector({ chains, options: { qrcode: true } })
      ]
    });
  }
  return client;
};

export {};
