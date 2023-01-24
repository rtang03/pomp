'use client';

import 'react-datepicker/dist/react-datepicker.css';

import { useAppContext } from '@components/AppContext';
import { logEvent } from '@firebase/analytics';
import { doc, setDoc } from '@firebase/firestore';
import Custom404 from '@pages/404';
import pickBy from 'lodash/pickBy';
import Link from 'next/link';
import { type ChangeEvent, type FC, useCallback, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import TextareaAutosize from 'react-textarea-autosize';

import useTypedDocument from '@/hooks/useTypedDocument';
import AttachmentsChooseFile from '@/Shared/AttachmentsChooseFile';
import ContentMarkdown from '@/Shared/ContentMarkdown';
import type { MissionData } from '@/types/MissionData';
import type { MissionDocument } from '@/types/MissionDocument';
import BlurImage from '@/UI/BlurImage';
import FooterAction from '@/UI/FooterAction';
import Loader from '@/UI/Loader';
import SaveButton from '@/UI/SaveButton';
import TabGroup from '@/UI/TabGroup';
import { elog, log } from '@/utils/consoleLog';
import { APP_URL, IPFS_DEDICATED_GATEWAY, OOPS } from '@/utils/constants';
import { formatDate } from '@/utils/formatter';
import saveImage from '@/utils/saveImage';

import { CONTENT_PLACEHOLDER } from './placeholder';

export type TAttachment = { item: string; type: string };

const SECRET = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
const LABEL = '[EditMission]';

const EditMissionMain: FC<{ id: string }> = ({ id }) => {
  const { analytics } = useAppContext();
  const isMounted = useRef<boolean>(false);
  const [data, setData] = useState<MissionData>({
    title: '',
    description: '',
    content: '',
    image: undefined,
    imageBlurhash: undefined,
    imageType: undefined,
    slug: '',
    status: undefined,
    startdate: new Date(),
    enddate: new Date()
  });
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [editOrPreview, setEditOrPreview] = useState<number>(0);
  const { dev, firestore, user } = useAppContext();
  const { value, loading, error } = useTypedDocument<MissionDocument>('mission', id);
  const [attachments, setAttachments] = useState<TAttachment[]>([]);
  const updatedAt = value?.updatedAt;
  const savedState = updatedAt ? formatDate(updatedAt) : 'Saving changes...';
  const [confirmed, setConfirmed] = useState(false);
  const canConfirm =
    !!data.description &&
    !!data.image &&
    !!data.title &&
    !!data.content &&
    !!data.slug &&
    !!data.startdate &&
    !!data.enddate;
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const canSave = !(
    data.title === value?.title &&
    data.content === value?.content &&
    data.description === value?.description &&
    data.image === value?.image &&
    data.startdate?.getTime() ===
      (value?.startdate ? value?.startdate.seconds * 1000 : undefined) &&
    data.enddate?.getTime() === (value?.enddate ? value?.enddate.seconds * 1000 : undefined)
  );
  const saveChanges = useCallback(
    async (data: MissionData) => {
      if (!isSaving && firestore && (confirmed ? canConfirm : canSave)) {
        setIsSaving(true);
        const mission: MissionDocument = {
          ...data,
          updatedAt: Date.now(),
          status: confirmed ? 'Published' : 'Draft'
        };
        const _mission = pickBy(mission, (v) => v !== undefined);
        setDoc(doc(firestore, 'mission', id as string), _mission, { merge: true })
          .then(async () => {
            setIsSaving(false);

            // Incremental Static Regeneration hook
            const response = await fetch(
              `/api/revalidate?secret=${SECRET}&slug=${data.slug}&update_index_page=${
                confirmed ? 'true' : 'false'
              }`
            );
            if (response.ok) {
              dev && log(LABEL, 'revalidate: ok');
            } else elog(LABEL, `revalidate: ${response.status}`);
          })
          .catch((error) => {
            elog(LABEL, error);
            setIsSaving(false);
          });
      }
    },
    [canConfirm, canSave, confirmed, dev, firestore, id, isSaving]
  );

  useEffect(() => {
    if (value && !isMounted.current) {
      isMounted.current = true;
      setData({
        ...data,
        title: value?.title,
        description: value?.description,
        content: value?.content,
        image: value?.image,
        imageType: value?.imageType,
        imageBlurhash: value?.imageBlurhash,
        slug: value?.slug || (id as string),
        status: value?.status,
        startdate: value?.startdate ? new Date(value.startdate.seconds * 1000) : null,
        enddate: value?.enddate ? new Date(value.enddate.seconds * 1000) : null
      });
    }
  }, [data, id, value]);

  useEffect(() => {
    const clickedSave = (e: KeyboardEvent) => {
      const charCode = String.fromCharCode(e.which).toLowerCase();
      if ((e.ctrlKey || e.metaKey) && charCode === 's') {
        e.preventDefault();
        let ignore = saveChanges(data);
      }
    };
    window.addEventListener('keydown', clickedSave);
    return () => window.removeEventListener('keydown', clickedSave);
  }, [data, saveChanges]);

  const readOnly = value?.status ? ['Published', 'Submitted'].includes(value.status) : undefined;

  const numberOfAttachments = attachments?.length || 0;
  const lastOne = attachments?.[numberOfAttachments - 1];
  const imageIpfs = (lastOne?.item || data?.image)
    ?.replace('https://ipfs.io/ipfs/', 'ipfs://')
    ?.replace(`${IPFS_DEDICATED_GATEWAY}/`, 'ipfs://');

  useEffect(() => {
    numberOfAttachments > 0 &&
      lastOne?.item !== data.image &&
      saveImage(lastOne?.item, lastOne?.type, data, setData);
  }, [data, lastOne?.item, lastOne?.type, numberOfAttachments]);

  if (!user) return <Custom404 />;

  return (
    <>
      <div className="my-5 justify-between md:flex">
        <Link href={`/creator`}>
          <div className="font-bold hover:opacity-50">
            ←<p className="ml-3 hidden md:inline-block">Missions</p>
          </div>
        </Link>
        <div className="flex border-b-2 px-2">
          <TabGroup
            titles={[<div key="editor">Editor</div>]}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
        </div>
        <div className="w-32" />
      </div>
      {loading ? (
        <Loader className="h-[800px]" />
      ) : (
        <>
          <TextareaAutosize
            readOnly={readOnly || confirmed}
            name="Title"
            className="mt-6 w-full resize-none border-none py-4 px-2 font-sans text-5xl text-gray-800 placeholder:text-gray-500/50 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-white"
            placeholder="Untitled Mission"
            value={data.title}
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({ ...data, title: (e.target as HTMLTextAreaElement).value })
            }
          />
          <TextareaAutosize
            readOnly={readOnly || confirmed}
            name="description"
            className="mb-3 w-full resize-none border-none py-3 px-2 text-xl text-gray-800 placeholder:text-gray-500/50 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-white"
            placeholder="No description provided. Click to edit."
            value={data.description}
            onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setData({ ...data, description: (e.target as HTMLTextAreaElement).value })
            }
          />
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-500/50" />
            </div>
          </div>
          <div className="mb-10 flex px-2 text-sm">
            <TabGroup
              titles={['Markdown', 'Preview']}
              selectedTab={editOrPreview}
              setSelectedTab={setEditOrPreview}
            />
          </div>
          {editOrPreview === 0 && (
            <TextareaAutosize
              readOnly={readOnly || confirmed}
              name="content"
              className="mb-5 w-full resize-none border-none py-3 px-2 text-lg text-gray-800 placeholder:text-gray-500/50 focus:outline-none focus:ring-0 dark:bg-transparent dark:text-white"
              placeholder={CONTENT_PLACEHOLDER}
              value={data.content}
              onInput={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setData({ ...data, content: (e.target as HTMLTextAreaElement).value })
              }
            />
          )}
          {editOrPreview === 1 && (
            <div className="mb-5 py-3">
              <ContentMarkdown content={data.content || '## No content found'} />
            </div>
          )}
          <div className="page-main">
            <h1 id="setting" className="page-top-header px-2 opacity-60">
              Add Cover Image
            </h1>
            <div className="space-y-6">
              <h2 className="page-section-title px-2">Slug</h2>
              <div className="prefix-slug mx-2">
                <div className="whitespace-nowrap rounded-l-lg border-r border-gray-600 px-2 font-sans text-xs md:text-base">
                  <span className="hidden md:block">{APP_URL}/m</span>
                </div>
                {value && (
                  <input
                    disabled
                    autoComplete="off"
                    className="w-full rounded-none rounded-r-lg border-none bg-white py-3 px-2 font-sans text-xs text-gray-700 placeholder:text-gray-500/30 focus:outline-none focus:ring-0 dark:bg-transparent md:text-base"
                    type="text"
                    name="slug"
                    value={value.slug || id || ''}
                    placeholder="mission-slug"
                    onInput={(e: ChangeEvent<HTMLInputElement>) =>
                      setData({ ...data, slug: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="space-y-6">
                <h2 className="page-section-title px-2">Cover Image</h2>
                <div
                  className={`${
                    data.image ? '' : 'h-[500px]'
                  } relative mt-5 w-full  rounded-md border-2 border-dashed border-gray-800`}
                >
                  {!confirmed && (
                    <AttachmentsChooseFile
                      className={`${
                        readOnly ? 'invisible' : ''
                      } absolute z-10 flex h-full w-full flex-col items-center justify-center rounded-md bg-gray-200 opacity-0 transition-all duration-200 ease-linear hover:opacity-100 dark:bg-gray-900`}
                      disabled={readOnly}
                      label={'post'}
                      setAttachments={setAttachments}
                      maxFileSize="2MB"
                      maxFile={1}
                      initialHide
                    />
                  )}
                  {data.image && (
                    <div className="relative h-[500px] w-[800px]">
                      <BlurImage
                        src={data.image}
                        alt="Cover Photo"
                        placeholder="blur"
                        className="rounded-md"
                        blurDataURL={data.imageBlurhash}
                      />
                    </div>
                  )}
                </div>
                <p className="title-text px-2 text-xs">{imageIpfs}</p>
              </div>
            </div>
          </div>
          <div className="page-main">
            <h1 id="publish" className="page-top-header px-2 opacity-60">
              Validity
            </h1>
            <div className="space-y-6">
              <h2 className="page-section-title px-2">Start date</h2>
              <div className="px-2">
                <DatePicker
                  disabled={readOnly}
                  closeOnScroll
                  selected={data.startdate}
                  onChange={(startdate) => setData({ ...data, startdate })}
                  className="bg-transparent"
                  selectsStart
                  startDate={data.startdate}
                  endDate={data.enddate}
                />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="page-section-title px-2">End date</h2>
              <div className="px-2">
                <DatePicker
                  disabled={readOnly}
                  closeOnScroll
                  selected={data.enddate}
                  onChange={(enddate) => setData({ ...data, enddate })}
                  className="bg-transparent"
                  selectsEnd
                  startDate={data.startdate}
                  endDate={data.enddate}
                  minDate={data.startdate}
                />
              </div>
            </div>
            {value?.status !== 'Published' && (
              <>
                {canConfirm ? (
                  <div className="flex items-center space-x-5 font-sans">
                    <input
                      id="confirm"
                      type="checkbox"
                      checked={confirmed}
                      onChange={() => setConfirmed(!confirmed)}
                    />
                    <label
                      htmlFor="confirm"
                      className={confirmed ? 'text-2xl' : 'text-2xl opacity-50'}
                    >
                      Confirm to Publish
                    </label>
                  </div>
                ) : (
                  <div>
                    <h2 className="page-section-title px-2">Missing info</h2>
                    <div className="flex-col space-y-2">
                      {!data.title && <div className="ml-10">Title is missing</div>}
                      {!data.description && <div className="ml-10">Description is missing</div>}
                      {!data.content && <div className="ml-10">Content is missing</div>}
                      {!data.slug && <div className="ml-10">Slug is missing</div>}
                      {!data.image && <div className="ml-10">Image is missing</div>}
                      {!data.startdate && <div className="ml-10">Start date is missing</div>}
                      {!data.enddate && <div className="ml-10">End date is missing</div>}
                    </div>
                  </div>
                )}
                {canConfirm && (
                  <div className="text-red-500">
                    After published, all content can no longer be changed.
                  </div>
                )}
              </>
            )}
          </div>
          <div className="page-main" />
          <FooterAction
            leftContent={
              <div className="text-sm">
                {error ? (
                  <>{OOPS}</>
                ) : (
                  <>
                    <strong>
                      <p>{value?.status || 'No Info'}</p>
                    </strong>
                    <p>{savedState}</p>
                  </>
                )}
              </div>
            }
            rightContent={
              value?.status !== 'Published' && (
                <SaveButton
                  type="button"
                  canSave={confirmed ? canConfirm : canSave}
                  loading={isSaving}
                  onClick={async () => {
                    await saveChanges(data);
                    confirmed &&
                      analytics &&
                      logEvent(analytics, 'level_start', {
                        level_name: 'new mission published'
                      });
                  }}
                  text={confirmed ? 'Publish' : 'Save'}
                />
              )
            }
          />
        </>
      )}
    </>
  );
};

export default EditMissionMain;
