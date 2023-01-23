'use client';

import { useAppContext } from '@components/AppContext';
import { type TransactionReceipt } from '@ethersproject/abstract-provider';
import { useCanClaim } from '@hooks/useCanClaim';
import { useDebounce } from '@hooks/useDebounce';
import { usePompPrepareWrite } from '@hooks/usePompOrNFTContract';
import { useProfileIdByHandleQuery, useProfileQuery } from '@hooks/useProfileMissionQuery';
import Custom404 from '@pages/404';
import { Form, Formik } from 'formik';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';
import { useContractWrite } from 'wagmi';
import * as Yup from 'yup';

import Input from '@/UI/Input';
import Loader from '@/UI/Loader';
import LoadingDots from '@/UI/LoadingDots';
import SaveButton from '@/UI/SaveButton';
import { elog, log } from '@/utils/consoleLog';
import { OOPS, STATUS } from '@/utils/constants';

import Admin from './Admin';
import Nfts from './Nfts';

const ProfileMain: FC = () => {
  const { dev, user, isAuthenticating } = useAppContext();
  const [receipt, setReceipt] = useState<TransactionReceipt>();
  const {
    isValidWalletAccount,
    refetch,
    isRoothashOutOfSync,
    profileId,
    canClaimError,
    canClaim,
    merkle,
    notWhitelistProfile,
    canClaimLoading
  } = useCanClaim();

  // check hande is available
  const [handleRef, setHandleRef] = useState<string>();
  const debouncedHandle: string | undefined = useDebounce<string | undefined>(handleRef, 1000);
  const {
    profileId: profileIdByHandle,
    isLoading: profileIdByHandleLoading,
    error: profileIdByHandleError,
    isRefetching: profileIdByHandleIsRefetching
  } = useProfileIdByHandleQuery(debouncedHandle || '', debouncedHandle !== handleRef);
  const isHandleAvailable = !!handleRef && !profileIdByHandle;

  // Prepare Write
  const { config } = usePompPrepareWrite(
    'createProfile',
    [handleRef || '', merkle?.proof],
    !handleRef || !merkle || merkle?.proof?.length === 0
  );

  // Write Contract
  const {
    writeAsync,
    isError: createProfileIsError,
    isLoading: createProfileLoading,
    isSuccess
  } = useContractWrite(config);

  // Read Profile struct
  const { profile } = useProfileQuery(profileId, !profileId);

  canClaimError && elog('[createProfile/canClaim]', canClaimError);

  if (isAuthenticating) return <Loader className="h-[800-px]" />;
  if (!user && !isAuthenticating) return <Custom404 />;

  return (
    <>
      {canClaimLoading ? (
        <Loader className="h-[800px]" />
      ) : (
        <>
          {isRoothashOutOfSync && (
            <div>The roothash is out-of-sync. Please contact administrator.</div>
          )}
          {canClaimError ? (
            <div>Oops, something bad happens.</div>
          ) : (
            <div className="space-y-6">
              {notWhitelistProfile && (
                <h2 className="page-section-title">You are not whitelisted</h2>
              )}
              {canClaim && (
                <>
                  <h2 className="page-section-title">You are eligible to claim your profile</h2>
                  <Formik
                    initialValues={{ handle: '' }}
                    validationSchema={Yup.object().shape({
                      handle: Yup.string()
                        .min(5, 'Too Short! Min 5 chars')
                        .max(30, 'Too Long! Max 30 chars')
                        .matches(
                          /^[a-z\d]+$/,
                          'Should only contain alphanumeric lowercase characters'
                        )
                        .required('Required')
                    })}
                    onSubmit={async ({ handle }, { setSubmitting, setStatus }) => {
                      setSubmitting(true);

                      setHandleRef(handle.toLowerCase());

                      if (!writeAsync) {
                        toast.error('Fail to prepare TX');
                        setSubmitting(false);
                        setStatus(STATUS.ERR);
                        return;
                      }

                      setStatus(STATUS.SENDING);

                      try {
                        const { hash, wait } = await writeAsync();

                        dev && log('[CreateProfile]/txHash', hash);

                        setStatus(STATUS.WAITING);

                        const _receipt: TransactionReceipt = await wait(1);
                        setReceipt(_receipt);

                        dev && log('[CreateProfile]/receipt', _receipt);

                        setStatus(STATUS.OK);

                        let ignore = refetch();
                      } catch (error) {
                        elog('[CreateProfile]', error);
                        setStatus(STATUS.ERR);
                      }

                      setSubmitting(false);
                    }}
                  >
                    {({ values, status, isSubmitting }) => (
                      <Form className="flex-col space-y-20">
                        <Input
                          label={
                            <div className="font-semibold">
                              Pick a handle (min-5 / max-30 lowercase alphanumeric chars)
                            </div>
                          }
                          autoComplete="off"
                          className="focus:ring-0"
                          id="handle"
                          name="handle"
                          placeholder="short memorable name"
                          prefix={
                            <p className="w-28">
                              {profileIdByHandleIsRefetching || profileIdByHandleLoading
                                ? 'Available ?'
                                : isHandleAvailable
                                ? 'Available ✓'
                                : 'Available ✘'}
                            </p>
                          }
                          disabled={
                            isSubmitting ||
                            isValidWalletAccount === false ||
                            status === STATUS.OK ||
                            status === STATUS.ERR
                          }
                          type="text"
                          onKeyUp={() => setHandleRef(values.handle)}
                        />
                        <div>
                          <SaveButton
                            type="submit"
                            text={
                              <>
                                {createProfileLoading ? (
                                  <LoadingDots />
                                ) : createProfileIsError ? (
                                  'Error'
                                ) : isSuccess ? (
                                  'Done'
                                ) : (
                                  'Sign Up'
                                )}
                              </>
                            }
                            canSave
                            disabled={
                              isValidWalletAccount === false || createProfileIsError || isSuccess
                            }
                            loading={createProfileLoading}
                          />
                          {profileIdByHandleError && <div>Oops! cannot check availability</div>}
                          {createProfileIsError && <div>{OOPS}</div>}
                        </div>
                        {receipt && <div>{receipt.transactionHash}</div>}
                      </Form>
                    )}
                  </Formik>
                </>
              )}
              {profileId && (
                <>
                  <h2 className="page-section-title hidden md:block">Profile found</h2>
                  <div>{profileId}</div>
                  {profile && (
                    <>
                      <h2 className="page-section-title">Handle</h2>
                      <div>{profile.handle}</div>
                      <h2 className="page-section-title">Mission count</h2>
                      <div>{profile.missionCount}</div>
                    </>
                  )}
                  <Nfts />
                  <Admin />
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ProfileMain;
