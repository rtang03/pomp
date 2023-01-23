'use client';

import { useCommon } from '@hooks/useCommon';
import { useDebounce } from '@hooks/useDebounce';
import {
  type TAddress,
  useHasRoleQuery,
  useMissionIdBySlug,
  useProfileByAddress,
  useRoleHashQuery
} from '@hooks/useProfileMissionQuery';
import { createTypedData } from '@utils/createTypedData';
import { onFormSubmitError } from '@utils/onFormSubmitError';
import { utils } from 'ethers';
import { Form, Formik } from 'formik';
import { customAlphabet } from 'nanoid';
import Link from 'next/link';
import { type Dispatch, type FC, useRef, useState } from 'react';
import * as Yup from 'yup';

import ViewAddressOnExplorer from '@/Shared/ViewAddressOnExplorer';
import { MetadataDisplayType } from '@/types/Metadata';
import { type MissionDocument } from '@/types/MissionDocument';
import { SmallBackButton } from '@/UI/Button';
import Input from '@/UI/Input';
import LoadingDots from '@/UI/LoadingDots';
import SaveButton from '@/UI/SaveButton';
import WarningMessage from '@/UI/WarningMessage';
import { elog, log } from '@/utils/consoleLog';
import {
  ADDRESS_LENGTH,
  CONFIRMATION_TIMES,
  LOCAL_CHAINID,
  SIGNATURE_PLACEHOLDER,
  STARTED_EVENT,
  STATUS,
  ZERO_ADDRESS
} from '@/utils/constants';
import { formatDate } from '@/utils/formatter';
import { uploadMetadataToIPFS } from '@/utils/uploadMetadataToIPFS';

type Props = {
  missionDoc: Required<MissionDocument>;
  setShow: Dispatch<boolean>;
};

const LABEL = '[Start]';
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
const trimify = (value: string): string => value?.replace(/[^\w\s']|_/g, '').replace(/\s+/g, ' ');
const IMAGE_URL = (title: string) =>
  `${
    process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : ''
  }/api/badge?title=${trimify(title)}&theme=light`;

type ParsedLog = { missionId: string; profileId: string };

const Start: FC<Props> = ({ missionDoc: m, setShow }) => {
  const {
    isValidWalletAccount,
    dev,
    address,
    chain,
    txHash,
    setTxHash,
    signTypedDataAsync,
    writeAsync,
    resetAll
  } = useCommon('startWithSig', [
    {
      profileId: 0,
      slug: '',
      contentURI: '',
      minutesToExpire: 0,
      creator: ZERO_ADDRESS,
      verifier: ZERO_ADDRESS,
      signature: SIGNATURE_PLACEHOLDER,
      deadline: 0
    }
  ]);
  const [nameRef, setNameRef] = useState<string>();
  const [parsedLog, setParsedLog] = useState<ParsedLog>();
  const verifierRef = useRef<TAddress>();

  const { profileId, isError: isErrorProfileByAddress } = useProfileByAddress(address, !address);
  const profileNotFound = profileId === null;
  const debouncedSlug: string | undefined = useDebounce<string | undefined>(nameRef, 1000);

  // isNameAvailable
  const {
    missionId,
    isRefetching: isRefetchingMissionId,
    isError: isErrorMissionId
  } = useMissionIdBySlug(debouncedSlug, debouncedSlug !== nameRef);
  const isNameAvailable = missionId === null;

  // isVerifierFound
  const { roleHash, isError: isErrorRoleHash } = useRoleHashQuery('VERIFIER', !verifierRef);
  const {
    hasRole,
    refetch: refetchHasRole,
    isRefetching: isRefetchingHasRole,
    isError: isErrorHasRole
  } = useHasRoleQuery(
    roleHash as TAddress,
    verifierRef.current?.length === ADDRESS_LENGTH ? verifierRef.current : ZERO_ADDRESS,
    !verifierRef.current || verifierRef.current?.length !== ADDRESS_LENGTH || !roleHash
  );

  return (
    <>
      <div className="flex justify-center border-b border-gray-500/50"></div>
      <div className="mx-auto mb-20 max-w-screen-lg grow px-0">
        <SmallBackButton handleClick={() => setShow(false)} />
        <h1 className="page-top-header px-2 opacity-60">Start Mission</h1>
        <div className="flex-col space-y-6 px-2">
          <div>
            <h2 className="page-section-title">Title</h2>
            <div>{m.title}</div>
          </div>
          <div>
            <h2 className="page-section-title">Description</h2>
            <div>{m.description}</div>
          </div>
          <div>
            <h2 className="page-section-title">End time</h2>
            <div>{formatDate(m.enddate.seconds * 1000, 'Expired by')}</div>
          </div>
          {profileNotFound ? (
            <WarningMessage
              isFYI
              showDismiss={false}
              title={<>Warning: Cannot start mission</>}
              message={
                <div className="flex space-x-2 p-5 text-xl">
                  <div>Profile Not Found.</div>
                  <Link href={`/player/profile`}>
                    <div className="link-text">Claim your profile</div>
                  </Link>
                </div>
              }
            />
          ) : (
            <Formik
              initialValues={{
                name: nanoid(),
                verifier: ''
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string().required('Required'),
                verifier: Yup.string()
                  .min(42, 'Invalid address length')
                  .max(42, 'Invalid address length')
                  .required('Required')
              })}
              onSubmit={async ({ name, verifier }, { setSubmitting, setStatus }) => {
                setSubmitting(true);

                if (!writeAsync) {
                  onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare config');
                  return;
                }

                // Step 1: prepare ipfs
                setStatus(STATUS.UPLOADING);
                const { ipfsUrl } = await uploadMetadataToIPFS({
                  name,
                  content: m.content,
                  description: m.description,
                  image: IMAGE_URL(m.title), // mission badge
                  imageMimeType: 'image/png',
                  media: [
                    // cover image
                    { item: m.image, type: m.imageType as any },
                    // mission badge
                    { item: IMAGE_URL(m.title), type: 'image/png' }
                  ],
                  attributes: [
                    {
                      display_type: MetadataDisplayType.string,
                      trait_type: 'mission_slug',
                      value: m.slug
                    },
                    {
                      display_type: MetadataDisplayType.string,
                      trait_type: 'title',
                      value: m.title
                    },
                    {
                      display_type: MetadataDisplayType.date,
                      trait_type: 'end_date',
                      value: m.enddate.seconds * 1000
                    },
                    {
                      display_type: MetadataDisplayType.date,
                      trait_type: 'start_date',
                      value: Date.now()
                    }
                  ]
                });
                dev && log(`${LABEL}/ipfs`, ipfsUrl);

                if (!ipfsUrl) {
                  onFormSubmitError(setSubmitting, setStatus, 'Fail to upload to ipfs');
                  return;
                }

                // step 2 prepare typed data
                setStatus(STATUS.PREPARING);

                const startTypedData = await createTypedData(`/api/createStartTypedData`, {
                  address,
                  profileId,
                  slug: name,
                  contentURI: ipfsUrl,
                  minutesToExpire: Math.floor((m.enddate.seconds * 1000 - Date.now()) / 60000),
                  creator: m.wallet, // mission creator. Not mission player
                  verifier
                });
                dev && log(`${LABEL}/typeData`, startTypedData);

                if (!startTypedData) {
                  onFormSubmitError(setSubmitting, setStatus, 'Fail to prepare typedData');
                  return;
                }

                // step 3 signing and send transaction
                try {
                  setStatus(STATUS.SIGNING);

                  const { hash, wait } = await signTypedDataAsync(startTypedData).then(
                    (signature) => {
                      dev && log(`${LABEL}/signature`, signature);

                      setStatus(STATUS.SENDING);

                      return writeAsync({
                        recklesslySetUnpreparedArgs: [
                          {
                            profileId: startTypedData.value.profileId,
                            slug: startTypedData.value.slug,
                            contentURI: startTypedData.value.contentURI,
                            minutesToExpire: startTypedData.value.minutesToExpire,
                            creator: startTypedData.value.creator,
                            verifier: startTypedData.value.verifier,
                            signature: signature as TAddress,
                            deadline: startTypedData.value.deadline
                          }
                        ]
                      });
                    }
                  );
                  setTxHash(hash);
                  dev && log(`${LABEL}/txHash`, hash);

                  setStatus(STATUS.OK);

                  const receipt = await wait(CONFIRMATION_TIMES);
                  const topics = receipt?.logs.find(
                    ({ topics }) => topics[0] === STARTED_EVENT
                  )?.topics;
                  if (topics) {
                    // topics[1] is "creator", is not used here.
                    setParsedLog({
                      profileId: utils.defaultAbiCoder
                        .decode(['uint256'], topics[2])[0]
                        .toHexString(),
                      missionId: utils.defaultAbiCoder
                        .decode(['uint256'], topics[3])[0]
                        .toHexString()
                    });
                  }
                } catch (err) {
                  elog(`${LABEL}/signTypedDataAsync`, err);
                  setStatus(STATUS.ERR);
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, status, isValid, values, setFieldValue, resetForm, setStatus }) => (
                <Form>
                  <div className="my-10 space-y-6">
                    <h2 className="page-section-title">Name</h2>
                    <Input
                      prefix={
                        <p className="w-28">
                          {isRefetchingMissionId
                            ? 'Available ?'
                            : isNameAvailable
                            ? `Available ✓`
                            : 'Available ✘'}
                        </p>
                      }
                      autoComplete="off"
                      className="focus:ring-0"
                      id="name"
                      name="name"
                      onKeyUp={() => setNameRef(values.name)}
                      placeholder="short memorable name"
                      type="text"
                      disabled={true}
                    />
                    {isErrorMissionId && <div>Oops, fail to check name availability</div>}
                    {isErrorProfileByAddress && <div>Oops, fail to fetch profile</div>}
                  </div>
                  <div className="my-10">
                    <h2 className="page-section-title">Verifier</h2>
                    <div className="text-sm">
                      Verifier address. Cannot be changed, after mission starts
                    </div>
                    <Input
                      setFieldValue={(field: string, value: any) => {
                        setFieldValue(field, value);
                        if (!isRefetchingHasRole) {
                          verifierRef.current = value;
                          let ignore = refetchHasRole();
                        }
                      }}
                      prefix={
                        <>
                          <p className="hidden w-28 md:block">
                            {isRefetchingHasRole ? 'Found ?' : hasRole ? `Found ✓` : 'Found ✘'}
                          </p>
                          <p className="block md:hidden">
                            {isRefetchingHasRole ? '?' : hasRole ? `✓` : '✘'}
                          </p>
                        </>
                      }
                      autoComplete="off"
                      className="text-[10px] focus:ring-0 md:text-base"
                      id="verifier"
                      name="verifier"
                      onKeyUp={() => {
                        if (!isRefetchingHasRole) {
                          verifierRef.current = values.verifier as TAddress;
                          let ignore = refetchHasRole();
                        }
                      }}
                      placeholder={'0x'}
                      type="text"
                      disabled={isSubmitting || [STATUS.OK, STATUS.ERR].includes(status)}
                    />
                    {(isErrorHasRole || isErrorRoleHash) && (
                      <div>Oops, fail to check verifier address.</div>
                    )}
                  </div>
                  <div className="my-20">
                    <SaveButton
                      type="submit"
                      canSave={isValid}
                      loading={isSubmitting}
                      disabled={
                        !isValid ||
                        isSubmitting ||
                        status === STATUS.OK ||
                        status === STATUS.ERR ||
                        !isValidWalletAccount
                      }
                      text={
                        <>
                          {isSubmitting ? (
                            <LoadingDots />
                          ) : status === STATUS.ERR ? (
                            'Error'
                          ) : status === STATUS.OK ? (
                            'Done'
                          ) : (
                            'Confirm'
                          )}
                        </>
                      }
                      reset={() => {
                        setStatus(STATUS.IDLE);
                        resetAll();
                        resetForm();
                      }}
                    />
                    {status && <div>status: {status}</div>}
                    {txHash && chain && chain.id !== LOCAL_CHAINID && (
                      <div className="my-10 flex items-center space-x-2">
                        <div>View Transaction</div>
                        <ViewAddressOnExplorer hash={txHash} />
                      </div>
                    )}
                    {parsedLog && (
                      <div className="flex-col space-y-6">
                        <h2 className="page-section-title pt-20 opacity-50">
                          You have successfully started this mission
                        </h2>
                        <div>
                          <h2 className="page-section-title">Mission Id</h2>
                          <div>{`${parsedLog.profileId}-${parsedLog.missionId}`}</div>
                        </div>
                      </div>
                    )}
                    <div className="my-10">
                      <Link href={`/player`}>
                        <div className="link-text my-10">Go to Player Dashboard</div>
                      </Link>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </div>
    </>
  );
};

export default Start;
