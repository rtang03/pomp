import remove from 'lodash/remove';
import Image from 'next/image';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

export const getConnectors = () => {
  const baseConnectors = [
    {
      title: 'Metamask',
      icon: <Image src={'/metamask.svg'} alt={'metamask'} height={50} width={50} />,
      connectorId: 'injected',
      priority: 1,
      connector: new MetaMaskConnector()
    },
    {
      title: 'WalletConnect',
      icon: (
        <Image src={'/walletconnect-square-white.svg'} alt={'metamask'} height={50} width={50} />
      ),
      connectorId: 'walletconnect',
      priority: 2,
      connector: new WalletConnectConnector({ options: { qrcode: true } })
    }
    // {
    //   title: 'Trust Wallet',
    //   icon: <MdOutlineShield className="inline-flex justify-center w-10 h-10 title-brand" />,
    //   connectorId: 'injected',
    //   priority: 3
    // }
    // {
    //   title: 'MathWallet',
    //   icon: MathWallet,
    //   connectorId: 'injected',
    //   priority: 999,
    // },
    // {
    //   title: 'TokenPocket',
    //   icon: TokenPocket,
    //   connectorId: 'injected',
    //   priority: 999,
    // },
    // {
    //   title: 'SafePal',
    //   icon: SafePal,
    //   connectorId: 'injected',
    //   priority: 999,
    // },
    // {
    //   title: 'Coin98',
    //   icon: Coin98,
    //   connectorId: 'injected',
    //   priority: 999,
    // },
  ];

  if (typeof window !== 'undefined')
    !(window as any)?.ethereum &&
      remove(baseConnectors, ({ connectorId }) => connectorId === 'injected');

  return baseConnectors;
};
