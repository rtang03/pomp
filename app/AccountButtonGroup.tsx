'use client';

import { logEvent } from '@firebase/analytics';
import {
  browserSessionPersistence,
  setPersistence,
  signInWithCustomToken,
  signOut
} from '@firebase/auth';
import { httpsCallable } from '@firebase/functions';
import { BigNumber } from 'ethers';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useEnsName,
  useNetwork,
  useSignMessage
} from 'wagmi';

import useAppContext from '@/Shared/AppContext';
import BigSquareBox from '@/UI/BigSquareBox';
import { Button } from '@/UI/Button';
import LoadingDots from '@/UI/LoadingDots';
import Modal from '@/UI/Modal';
// import ToggleThemeButton from '@/UI/ToggleThemeButton';
import { elog } from '@/utils/consoleLog';
import { shortenAddress } from '@/utils/shortenAddress';

const AccountButtonGroup = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { chain } = useNetwork();
  const { connectAsync, connectors, error, pendingConnector } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { isConnected, address, connector } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { signMessageAsync } = useSignMessage();
  const {
    analytics,
    isAuthenticating,
    setIsAuthenticating,
    firebaseFunctions: functions,
    firebaseAuth: auth,
    user
  } = useAppContext();
  const requestMessage =
    functions &&
    httpsCallable<{ chain: string; address: string }, { message: string; profileId: string }>(
      functions,
      'requestMessage'
    );
  const issueToken =
    functions &&
    httpsCallable<{ message: string; signature: string }, { token: string }>(
      functions,
      'issueToken'
    );
  const [showModal, setShowModal] = useState<boolean>(false);
  const authentiate = async (connector: Connector) => {
    setIsAuthenticating(true);

    if (isConnected) await disconnectAsync();

    const { account, chain } = await connectAsync({ connector });
    const chainId = BigNumber.from(chain.id).toHexString();

    if (!requestMessage || !issueToken || !auth) throw new Error('Unknown Error');

    let message: string;
    let signature: string;
    let token: string;

    try {
      const messageResponse = await requestMessage({ chain: chainId, address: account });
      message = messageResponse.data.message;
    } catch (error) {
      elog('[Account] requestMessage', error);
      toast.error('Fail to request');
      return setIsAuthenticating(false);
    }

    try {
      signature = await signMessageAsync({ message });
    } catch (error) {
      elog('[Account] signMessage', error);
      toast.error('Fail to sign messge');
      return setIsAuthenticating(false);
    }

    try {
      const tokenResponse = await issueToken({ message, signature });
      token = tokenResponse.data.token;
    } catch (error) {
      elog('[Account] issueToken', error);
      toast.error('Fail to issue token');
      return setIsAuthenticating(false);
    }

    try {
      await setPersistence(auth, browserSessionPersistence).then(() =>
        signInWithCustomToken(auth, token)
      );
    } catch (error) {
      elog('[Account] Signin', error);
      toast.error('Fail to authenticate');
    }

    setIsAuthenticating(false);
    setShowModal(false);
  };
  const loggedIn = isConnected && !!user;

  return (
    <>
      {/*<ToggleThemeButton theme={theme as string} />*/}
      <div className="flex-col">
        <Button
          className="bg-white text-sm dark:bg-transparent dark:text-white md:text-base"
          disabled={isAuthenticating || !auth || loggedIn}
          handleClick={() => setShowModal(true)}
        >
          {isAuthenticating ? (
            <LoadingDots />
          ) : (
            <>{loggedIn ? ensName || shortenAddress(address || 'Anoymous') : 'Wallet'}</>
          )}
        </Button>
        {auth && loggedIn && (
          <div className="flex-col space-y-0 leading-3">
            <motion.button
              disabled={!isConnected || !user}
              whileTap={{ scale: 0.95 }}
              className={`text-xs font-normal underline ${
                !isConnected || !user ? 'opacity-50' : ''
              }`}
              type="button"
              onClick={async () => {
                await router.push('/');

                return signOut(auth)
                  .then(() => toast.success('Logged out'))
                  .catch((error) => {
                    elog('[Account]', error);
                    toast.error('Fail to logout');
                  });
              }}
            >
              Logout
            </motion.button>
            <div className="hidden items-center space-x-2 md:flex">
              <div className="text-xs opacity-50">{chain?.name}</div>
              <div className="text-xs opacity-50">{connector?.name}</div>
            </div>
          </div>
        )}
        <Modal isOpen={showModal} handleClose={() => setShowModal(false)}>
          <div className="block justify-center space-y-2 md:flex md:space-y-0 md:space-x-2">
            {connectors.map((connector) => (
              <BigSquareBox
                key={connector.id}
                disabled={!connector.ready || isAuthenticating}
                text={
                  <div className="font-sans">
                    {connector.name}
                    {isAuthenticating && connector.id === pendingConnector?.id && ' (connecting)'}
                  </div>
                }
                handleClick={async () => {
                  await authentiate(connector);
                  analytics && logEvent(analytics, 'login', { method: connector.name });
                }}
              />
            ))}
          </div>
          {error && <div>{error.message}</div>}
        </Modal>
      </div>
    </>
  );
};

export default AccountButtonGroup;
