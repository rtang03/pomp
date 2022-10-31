import { useAppContext } from '@components/AppContext';
import ChallengeInputField from '@components/Shared/ChallengeInputField';
import SimpleActionModal from '@components/Shared/SimpleActionModal';
import TransactionStatus from '@components/Shared/TransactionStatus';
import Input from '@components/UI/Input';
import { logEvent } from '@firebase/analytics';
import { useCommon } from '@hooks/useCommon';
import { type TAddress } from '@hooks/useProfileMissionQuery';
import { elog, log } from '@utils/consoleLog';
import { createTypedData } from '@utils/createTypedData';
import { onFormSubmitError } from '@utils/onFormSubmitError';
import { Form, Formik } from 'formik';
import { type Dispatch, type FC } from 'react';
import {
  CONFIRMATION_TIMES,
  MIN_CHALLENGE_LENGTH,
  SIGNATURE_PLACEHOLDER,
  STATUS
} from 'src/constants';
import type { MissionStruct } from 'src/types';
import * as Yup from 'yup';

type Props = {
  mission: MissionStruct & { missionId: number };
  showModal: boolean;
  setShowModal: Dispatch<boolean>;
};

const LABEL = '[Fail]';

const Fail: FC<Props> = ({ mission, showModal, setShowModal }) => {
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
  } = useCommon('failWithSig', [
    {
      profileId: 0,
      challenge: '',
      reason: 0,
      signature: SIGNATURE_PLACEHOLDER,
      deadline: 0
    }
  ]);

  return (
    <Formik
      initialValues={{ challenge: '', reason: '' }}
      validationSchema={Yup.object().shape({
        challenge: Yup.string()
          .min(MIN_CHALLENGE_LENGTH, 'Code challenge too short')
          .required('Required'),
        reason: Yup.number().positive().required('Required')
      })}
      onSubmit={async ({ challenge, reason }, { setSubmitting, setStatus }) => {
        setSubmitting(true);

        if (!writeAsync) {
          onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare config');
          return;
        }

        setStatus(STATUS.PREPARING);

        const typedData = await createTypedData('/api/createFailTypedData', {
          address,
          profileId: mission.profileId,
          reason,
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
                  reason: typedData.value.reason,
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

          analytics && logEvent(analytics, 'form_submit', { form_name: 'failWithSig' });
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
            actionText={<>You are about to fail mission.</>}
            buttonText={<>Fail</>}
            body={
              <div className="my-10 flex-col space-y-6">
                <ChallengeInputField
                  setFieldValue={setFieldValue}
                  disabled={isSubmitting || status === STATUS.OK || status == STATUS.ERR}
                />
                <div>
                  <h2 className="page-section-title text-start">Reason</h2>
                  <Input
                    autoComplete="off"
                    className="focus:ring-0"
                    id="reason"
                    name="reason"
                    type="number"
                    placeholder="1"
                    min={1}
                    max={50}
                    step={1}
                  />
                </div>
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

export default Fail;
