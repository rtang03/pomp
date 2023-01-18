'use client';

import { useAppContext } from '@components/AppContext';
import { logEvent } from '@firebase/analytics';
import { useCommon } from '@hooks/useCommon';
import { TAddress, useProfileQuery } from '@hooks/useProfileMissionQuery';
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
};

const LABEL = '[Verify]';
const SECRET = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;

const Verify: FC<Props> = ({ mission, showModal, setShowModal }) => {
  const { analytics } = useAppContext();
  const {
    isValidWalletAccount,
    dev,
    address,
    resetAll,
    setReceipt,
    txHash,
    setTxHash,
    signTypedDataAsync,
    writeAsync
  } = useCommon('verifyWithSig', [
    {
      profileId: 0,
      challenge: '',
      signature: SIGNATURE_PLACEHOLDER,
      deadline: 0
    }
  ]);
  const { profile } = useProfileQuery(mission.profileId, !mission.profileId);

  // revalidate is required for post-verify, to update profile public page.
  const revalidate = async () => {
    if (profile?.handle) {
      const response = await fetch(
        `/api/revalidate-profile?secret=${SECRET}&slug=${profile.handle}`
      );
      if (response.ok) {
        dev && log(LABEL, 'revalidate-profile: ok');
      } else elog(LABEL, `revalidate-profile: ${response.status}`);
    }
  };

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

        const typedData = await createTypedData('/api/createVerifyTypedData', {
          address,
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

          analytics && logEvent(analytics, 'form_submit', { form_name: 'verifYWithSig' });

          return revalidate();
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
            actionText={<>You are about to verify mission.</>}
            buttonText={<>Verify</>}
            body={
              <div className="my-10 flex-col space-y-6">
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

export default Verify;
