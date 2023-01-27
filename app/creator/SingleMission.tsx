'use client';

import { deleteDoc, doc, setDoc } from '@firebase/firestore';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { type FC, useState } from 'react';
import toast from 'react-hot-toast';
import { BsArchive, BsTrash } from 'react-icons/bs';

import useAppContext from '@/Shared/AppContext';
import type { MissionDocument } from '@/types/MissionDocument';
import BlurImage from '@/UI/BlurImage';
import { Card } from '@/UI/Card';
import SimpleActionModal from '@/UI/SimpleActionModal';
import { elog, log } from '@/utils/consoleLog';
import { formatDate } from '@/utils/formatter';

type Props = {
  mission: MissionDocument;
};
const SECRET = process.env.NEXT_PUBLIC_REVALIDATE_SECRET;
const INITIAL_STATE = {
  delete: false,
  archive: false
};
const LABEL = '[SingleMission]';

const SingleMission: FC<Props> = ({ mission: m }) => {
  const { dev, user } = useAppContext();
  const [showModal, setShowModal] = useState<{ delete: boolean; archive: boolean }>(INITIAL_STATE);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isArchiving, setIsArchiving] = useState<boolean>(false);
  const { firestore } = useAppContext();
  const isPublished = m.status === 'Published';
  const isArchived = m.status === 'Archived';

  return (
    <Card className="block justify-between space-y-2 md:flex md:space-x-10">
      <div className="block overflow-hidden md:flex md:space-x-5">
        <div className="w-full md:w-32">
          {m.image ? (
            <div className="relative h-[150px] w-[150px]">
              <BlurImage
                alt={m.title ?? 'Unknown Thumbnail'}
                src={m.image}
                blurDataURL={m.imageBlurhash as string}
                placeholder="blur"
              />
            </div>
          ) : (
            <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-2xl text-gray-500 md:h-full">
              No cover
            </div>
          )}
        </div>
        <div className="flex-col p-2">
          <Link href={`/edit/${m.id}`}>
            <div className="text-xl text-blue-500 line-clamp-1">{m.title || 'No Title'}</div>
          </Link>
          <div className="title-text line-clamp-2">{m.description || 'No description'}</div>
          <div className="text-sm">
            {m.updatedAt && <span className="italic">{formatDate(m.updatedAt)}</span>}
          </div>
          {isPublished ? (
            <Link href={`/m/${m.id}`}>
              <div className="link-text">{m.status}</div>
            </Link>
          ) : (
            <a
              className="link-text"
              target="_blank"
              rel="noreferrer"
              href={`${window?.location?.origin}/m/${m.id}`}
            >
              {m.status}
            </a>
          )}
        </div>
      </div>
      <div className="flex justify-end md:block">
        {isArchived ? (
          <div />
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            className="px-2"
            onClick={() =>
              isPublished
                ? setShowModal({ delete: false, archive: true })
                : setShowModal({ delete: true, archive: false })
            }
          >
            {isPublished ? (
              <BsArchive className="h-5 w-5 opacity-70" />
            ) : (
              <BsTrash className="h-5 w-5 opacity-70" />
            )}
          </motion.button>
        )}
      </div>
      <SimpleActionModal
        disabled={isArchiving}
        showModal={showModal.archive}
        setShowModal={(toggle) => setShowModal({ delete: false, archive: toggle })}
        isLoading={isArchiving}
        actionText={<>You are archiving a mission; this operation cannot be undone.</>}
        buttonText={<>Archive</>}
        handleClick={async () => {
          if (firestore && m.id) {
            setIsArchiving(true);
            await setDoc(doc(firestore, 'mission', m.id), { status: 'Archived' }, { merge: true })
              .then(async () => {
                // Incremental Static Regeneration hook
                const response = await fetch(
                  `/api/revalidate?secret=${SECRET}&slug=${m.slug}&update_index_page=true`
                );
                if (response.ok) {
                  dev && log(LABEL, 'revalidate: ok');
                } else elog(LABEL, `revalidate: ${response.status}`);
              })
              .catch((error) => {
                elog(LABEL, error);
                toast.error('Fail to archive doc');
              })
              .finally(() => setIsArchiving(false));
          } else toast.error('Fail to archive doc');
          setShowModal(INITIAL_STATE);
        }}
      />
      <SimpleActionModal
        disabled={isDeleting}
        showModal={showModal.delete}
        setShowModal={(toggle) => setShowModal({ delete: toggle, archive: false })}
        isLoading={isDeleting}
        actionText={<>You are deleting drafted-mission.</>}
        buttonText={<>Delete</>}
        handleClick={async () => {
          if (firestore && m.id) {
            setIsDeleting(true);
            await deleteDoc(doc(firestore, 'mission', m.id)).catch((error) => {
              elog(LABEL, error);
              toast.error('Fail to delete doc');
            });
            setIsDeleting(false);
          } else toast.error('Fail to delete doc');
          setShowModal(INITIAL_STATE);
        }}
      />
    </Card>
  );
};

export default SingleMission;
