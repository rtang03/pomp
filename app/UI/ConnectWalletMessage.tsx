'use client';

import type { Dispatch, FC, ReactNode } from 'react';
import { GiGreenPower } from 'react-icons/gi';

import Modal from '@/UI/Modal';
import WarningMessage from '@/UI/WarningMessage';

export const ConnectWalletMessage = () => (
  <WarningMessage
    isFYI
    message={
      <div className="flex items-center space-x-5">
        <GiGreenPower className="h-20 w-20 text-blue-500" />
        <p className="title-text">
          This request is protected by authentication. Please connect wallet.
        </p>
      </div>
    }
  />
);

type Props = {
  showModal: boolean;
  setShowModal: Dispatch<boolean>;
  title?: string | ReactNode;
  showConnectWalletMessage: boolean;
  children?: ReactNode;
};

export const ModalWithConnectWalletMessage: FC<Props> = ({
  setShowModal,
  showModal,
  title,
  showConnectWalletMessage,
  children
}) => (
  <Modal title={title} isOpen={showModal} handleClose={() => setShowModal(!showModal)}>
    {showConnectWalletMessage ? <ConnectWalletMessage /> : <>{children}</>}
  </Modal>
);
