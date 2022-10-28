import { useAppContext } from '@components/AppContext';
import Input from '@components/UI/Input';
import LoadingDots from '@components/UI/LoadingDots';
import SaveButton from '@components/UI/SaveButton';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { usePompPrepareWrite } from '@hooks/usePompOrNFTContract';
import { useHasRoleQuery, useRoleHashQuery } from '@hooks/useProfileMissionQuery';
import { elog, log } from '@utils/consoleLog';
import { onFormSubmitError } from '@utils/onFormSubmitError';
import { Form, Formik } from 'formik';
import { type FC, useRef, useState } from 'react';
import { ADDRESS_LENGTH, OOPS, STATUS, ZERO_ADDRESS } from 'src/constants';
import { useContractWrite } from 'wagmi';
import * as Yup from 'yup';

type Props = {
  kind: 'VERIFIER' | 'CREATOR';
};

const LABEL = '[AddRole]';

const AddRole: FC<Props> = ({ kind }) => {
  const { dev } = useAppContext();
  const walletRef = useRef<string>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const { roleHash, isError: isErrorRoleHash } = useRoleHashQuery(kind, !walletRef);
  const {
    hasRole,
    refetch: refetchHasRole,
    isRefetching: isRefetchingHasRole,
    isError: isErrorHasRole
  } = useHasRoleQuery(
    roleHash,
    walletRef.current?.length === ADDRESS_LENGTH ? walletRef.current : ZERO_ADDRESS,
    !walletRef?.current || walletRef.current?.length !== ADDRESS_LENGTH
  );
  const buttonText = hasRole ? 'Revoke' : 'Grant';

  const { config } = usePompPrepareWrite(
    hasRole ? 'revokeRole' : 'grantRole',
    [roleHash, walletRef.current || ZERO_ADDRESS],
    !roleHash
  );

  const {
    writeAsync,
    isError: grantOrRevokeRoleIsError,
    isLoading: grantOrRevokeRoleLoading,
    isSuccess,
    reset
  } = useContractWrite(config);

  return (
    <Formik
      initialValues={{ wallet: '' }}
      validationSchema={Yup.object().shape({
        wallet: Yup.string()
          .min(42, 'Invalid address length')
          .max(42, 'Invalid address length')
          .required('Required')
      })}
      onSubmit={async ({ wallet }, { setSubmitting, setStatus }) => {
        setSubmitting(true);

        if (!writeAsync) {
          onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare TX');
          return;
        }

        setStatus(STATUS.SENDING);

        try {
          const { hash, wait } = await writeAsync({
            recklesslySetUnpreparedArgs: [roleHash, wallet]
          });

          dev && log(`${LABEL}/txHash`, hash);

          setStatus(STATUS.WAITING);

          const _receipt = await wait(1);
          setReceipt(_receipt);

          dev && log(`${LABEL}/receipt`, _receipt);

          setStatus(STATUS.OK);

          let ignore = refetchHasRole();
        } catch (err) {
          elog(`${LABEL}/${kind}`, err);
          setStatus(STATUS.ERR);
        }
        setSubmitting(false);
      }}
    >
      {({ isSubmitting, status, resetForm, values, isValid, setFieldValue, setStatus }) => (
        <Form>
          <div className="">
            <h2 className="page-section-title">Add {kind.toLowerCase()}</h2>
            <Input
              prefix={
                <>
                  <p className="hidden w-28 md:block">{hasRole ? `Granted ✓` : 'Available ❍'}</p>
                  <p className="block md:hidden">{hasRole ? `✓` : '❍'}</p>
                </>
              }
              className="text-[10px] focus:ring-0 md:text-base"
              autoComplete="off"
              id="wallet"
              name="wallet"
              type="text"
              placeholder={'0x'}
              setFieldValue={(field: string, value: any) => {
                setFieldValue(field, value);
                if (!isRefetchingHasRole) {
                  walletRef.current = value;
                  let ignore = refetchHasRole();
                }
              }}
              disabled={isSubmitting || status === STATUS.OK || status === STATUS.ERR}
              onKeyUp={() => {
                if (!isRefetchingHasRole) {
                  walletRef.current = values.wallet;
                  let ignore = refetchHasRole();
                }
              }}
            />
            {(isErrorHasRole || isErrorRoleHash) && <div>Oops, fail to check address.</div>}
            <div className="my-10">
              <SaveButton
                type="submit"
                canSave={isValid && !isSubmitting}
                loading={isSubmitting || grantOrRevokeRoleLoading}
                disabled={!isValid || isSubmitting || isSuccess}
                text={
                  <>
                    {isSubmitting ? (
                      <LoadingDots />
                    ) : grantOrRevokeRoleIsError ? (
                      'Error'
                    ) : isSuccess ? (
                      'Done'
                    ) : (
                      buttonText
                    )}
                  </>
                }
                reset={() => {
                  setReceipt(undefined);
                  reset();
                  resetForm();
                  setStatus(STATUS.IDLE);
                }}
              />
              {grantOrRevokeRoleIsError && <div>{OOPS}</div>}
            </div>
            {receipt && <div className="text-sm">txhash: {receipt.transactionHash}</div>}
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AddRole;
