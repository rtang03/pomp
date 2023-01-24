'use client';

import { useAppContext } from '@components/AppContext';
import { logEvent } from '@firebase/analytics';
import { Form, Formik } from 'formik';
import type { Dispatch, FC } from 'react';

import useCommon from '@/hooks/useCommon';
import type { TAddress, TContractInfiniteReadsRefetch } from '@/hooks/useProfileMissionQuery';
import TransactionStatus from '@/Shared/TransactionStatus';
import type { MissionStruct } from '@/types/PompContractStruct';
import SimpleActionModal from '@/UI/SimpleActionModal';
import { elog, log } from '@/utils/consoleLog';
import { CONFIRMATION_TIMES, SIGNATURE_PLACEHOLDER, STATUS } from '@/utils/constants';
import { createTypedData } from '@/utils/createTypedData';
import { onFormSubmitError } from '@/utils/onFormSubmitError';

type Props = {
  mission: MissionStruct & { missionId: number };
  showModal: boolean;
  setShowModal: Dispatch<boolean>;
  refetch?: TContractInfiniteReadsRefetch;
};

const LABEL = '[Abort]';
const Abort: FC<Props> = ({ mission, showModal, setShowModal, refetch }) => {
  const { analytics } = useAppContext();
  const {
    isValidWalletAccount,
    dev,
    address,
    setReceipt,
    txHash,
    setTxHash,
    signTypedDataAsync,
    writeAsync,
    resetAll
  } = useCommon('abortWithSig', [
    {
      profileId: 0,
      missionId: 0,
      signature: SIGNATURE_PLACEHOLDER,
      deadline: 0
    }
  ]);

  return (
    <Formik
      initialValues={{}}
      onSubmit={async (_, { setSubmitting, setStatus }) => {
        setSubmitting(true);

        if (!writeAsync) {
          onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare config');
          return;
        }

        setStatus(STATUS.PREPARING);

        const typedData = await createTypedData('/api/createAbortTypedData', {
          address,
          missionId: mission.missionId,
          profileId: mission.profileId
        });
        dev && log(`${LABEL}/typeData`, typedData);

        if (!typedData) {
          onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare typedData');
          return;
        }

        try {
          setStatus(STATUS.SIGNING);

          const { hash, wait } = await signTypedDataAsync(typedData).then((signature) => {
            setStatus(STATUS.SENDING);

            return writeAsync({
              recklesslySetUnpreparedArgs: [
                {
                  profileId: typedData.value.profileId,
                  missionId: typedData.value.missionId,
                  deadline: typedData.value.deadline,
                  signature: signature as TAddress
                }
              ]
            });
          });
          setTxHash(hash);
          setStatus(STATUS.WAITING);
          const _receipt = await wait(CONFIRMATION_TIMES);
          setReceipt(_receipt);
          setStatus(STATUS.OK);

          analytics && logEvent(analytics, 'form_submit', { form_name: 'abortWithSig' });

          return refetch?.();
        } catch (err) {
          elog(`${LABEL}/signTypedDataAsync`, err);
          setStatus(STATUS.ERR);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, submitForm, status, resetForm, setStatus }) => (
        <Form>
          <SimpleActionModal
            disabled={!isValidWalletAccount || status === STATUS.OK || status == STATUS.ERR}
            showModal={showModal}
            setShowModal={setShowModal}
            isLoading={isSubmitting}
            handleClick={() => submitForm()}
            actionText={<>You are about to abort mission.</>}
            buttonText={<>Abort</>}
            footer={<TransactionStatus status={status} txHash={txHash} />}
            reset={() => {
              setStatus(STATUS.IDLE);
              resetAll();
              resetForm();
            }}
          />
        </Form>
      )}
    </Formik>
  );
};

export default Abort;
