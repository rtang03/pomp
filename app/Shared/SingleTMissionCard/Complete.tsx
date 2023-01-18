'use client';

import { useAppContext } from '@components/AppContext';
import { logEvent } from '@firebase/analytics';
import { useCommon } from '@hooks/useCommon';
import type { TContractInfiniteReadsRefetch } from '@hooks/useProfileMissionQuery';
import { TAddress } from '@hooks/useProfileMissionQuery';
import { elog, log } from '@utils/consoleLog';
import { createTypedData } from '@utils/createTypedData';
import { onFormSubmitError } from '@utils/onFormSubmitError';
import { Form, Formik } from 'formik';
import type { Dispatch, FC } from 'react';
import {
  CONFIRMATION_TIMES,
  MIN_CHALLENGE_LENGTH,
  SIGNATURE_PLACEHOLDER,
  STATUS
} from 'src/constants';
import type { MissionStruct } from 'src/types';
import * as Yup from 'yup';

import SimpleActionModal from '../../UI/SimpleActionModal';
import ChallengeInputField from '../ChallengeInputField';
import TransactionStatus from '../TransactionStatus';

type Props = {
  mission: MissionStruct & { missionId: number };
  showModal: boolean;
  setShowModal: Dispatch<boolean>;
  refetch?: TContractInfiniteReadsRefetch;
};

const LABEL = '[Complete]';
const Complete: FC<Props> = ({ mission, showModal, setShowModal, refetch }) => {
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
  } = useCommon('completeWithSig', [
    {
      profileId: 0,
      missionId: 0,
      challenge: '',
      signature: SIGNATURE_PLACEHOLDER,
      deadline: 0
    }
  ]);

  return (
    <Formik
      initialValues={{ challenge: '' }}
      validationSchema={Yup.object().shape({
        challenge: Yup.string()
          .min(MIN_CHALLENGE_LENGTH, 'Code challenge too short')
          .required('Required')
      })}
      onSubmit={async ({ challenge }, { setSubmitting, setStatus }) => {
        setSubmitting(true);

        if (!writeAsync) {
          onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare config');
          return;
        }

        setStatus(STATUS.PREPARING);

        const typedData = await createTypedData('/api/createCompleteTypedData', {
          address,
          missionId: mission.missionId,
          profileId: mission.profileId,
          challenge
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
                  challenge: typedData.value.challenge,
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

          analytics && logEvent(analytics, 'form_submit', { form_name: 'completeWithSig' });

          return refetch?.();
        } catch (err) {
          elog(`${LABEL}/signTypedDataAsync`, err);
          setStatus(STATUS.ERR);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, submitForm, status, setFieldValue, resetForm, setStatus }) => (
        <Form>
          <SimpleActionModal
            disabled={!isValidWalletAccount || status === STATUS.OK || status == STATUS.ERR}
            showModal={showModal}
            setShowModal={setShowModal}
            isLoading={isSubmitting}
            handleClick={() => submitForm()}
            actionText={<>You are about to complete mission.</>}
            buttonText={<>Complete</>}
            body={
              <div className="my-10">
                <ChallengeInputField
                  setFieldValue={setFieldValue}
                  disabled={isSubmitting || status === STATUS.OK || status == STATUS.ERR}
                />
              </div>
            }
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

export default Complete;
