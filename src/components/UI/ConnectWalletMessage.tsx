import Modal from '@components/UI/Modal';
import { WarningMessage } from '@components/UI/WarningMessage';
import type { Dispatch, FC, ReactNode } from 'react';
import { GiGreenPower } from 'react-icons/gi';

export const ConnectWalletMessage = () => {
  return (
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
};

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
}) => {
  return (
    <Modal title={title} isOpen={showModal} handleClose={() => setShowModal(!showModal)}>
      {showConnectWalletMessage ? <ConnectWalletMessage /> : <>{children}</>}
    </Modal>
  );
};
