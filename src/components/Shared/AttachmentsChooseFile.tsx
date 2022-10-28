import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

import { elog } from '@utils/consoleLog';
import {
  type ProcessServerConfigFunction,
  type RevertServerConfigFunction,
  FilePondFile
} from 'filepond';
import FilePondPluginFileRename from 'filepond-plugin-file-rename';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import FilePondPluginImageEdit from 'filepond-plugin-image-edit';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { motion } from 'framer-motion';
import { type Dispatch, type FC, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateType,
  FilePondPluginFileRename,
  FilePondPluginFileValidateSize,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform,
  FilePondPluginImageEdit
);

type Props = {
  initialHide?: boolean;
  label: string;
  setAttachments: Dispatch<any>;
  maxFileSize?: string;
  maxFile?: number;
  disabled?: boolean;
  className?: string;
};

const MAX_FILESIZE = '2MB';
const MAX_FILE = 2;
const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJSEC;

const AttachmentsChooseFile: FC<Props> = ({
  initialHide = false,
  label,
  disabled,
  maxFileSize = MAX_FILESIZE,
  maxFile = MAX_FILE,
  setAttachments,
  className
}) => {
  const [files, setFiles] = useState<FilePondFile[]>([]);
  const [show, setShow] = useState<boolean>(initialHide);

  const process: ProcessServerConfigFunction = (
    _fieldName,
    file,
    metadata,
    load,
    error,
    progress,
    abort
  ) => {
    progress(false, 0, 0);

    const formData = new FormData();
    formData.append('file', file, 'img');

    const option: RequestInit = {
      method: 'POST',
      body: formData,
      headers: {
        authorization: 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
      }
    };

    return fetch('https://ipfs.infura.io:5001/api/v0/add', option)
      .then((result) => result.json())
      .then((json) => {
        if (json?.Hash) {
          setAttachments((attachments: any[]) => {
            // remove already existed item of the same hash
            const newAttachments = attachments?.filter(
              (attachment) => !attachment.item.includes(json.Hash)
            );
            return [
              ...newAttachments,
              { type: file.type, item: `https://ipfs.io/ipfs/${json.Hash}` }
            ];
          });
          load(json.Hash);
        } else {
          error('Unknown error');
          console.error('Unknown error in uploading file', json);
          abort();
        }
      })
      .catch((error) => {
        error(error.message);
        elog('[Shared/AttachmentsChooseFile] Uploading File', error);
        abort();
      });
  };

  const revert: RevertServerConfigFunction = (uniqueFieldId, load, _error) => {
    setAttachments((attachments: any[]) => {
      const newAttachments = attachments?.filter(
        (attachment) => !attachment.item.includes(uniqueFieldId)
      );
      return [...newAttachments];
    });
    load();
  };

  return (
    <div className={className}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        className="title-text flex w-full items-center space-x-2"
        onClick={() => setShow((v) => !v)}
      >
        <div className="text-xs">Media</div>
        <div>
          {show ? <FaChevronUp className="h-3 w-3" /> : <FaChevronDown className="h-3 w-3" />}
        </div>
      </motion.button>
      {show && (
        <motion.div
          className="h-full w-full"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -20 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.15 }}
        >
          <FilePond
            className="filepond--panel-root"
            instantUpload={true}
            disabled={disabled}
            allowMultiple={true}
            files={files as any}
            onupdatefiles={setFiles}
            name="files"
            labelIdle={`Drop max ${maxFile} files / total ${maxFileSize} <div>or <span class='filepond--label-action'>Browse</span></div>`}
            server={{ process, revert }}
            acceptedFileTypes={['image/png', 'image/jpeg', 'image/gif', 'video/mp4']}
            fileRenameFunction={(file) =>
              `${label}-${Math.floor(Math.random() * 100000)}${file.extension}` || file.name
            }
            maxFileSize={maxFileSize}
            maxFiles={maxFile}
            allowReorder={false}
          />
        </motion.div>
      )}
    </div>
  );
};

export default AttachmentsChooseFile;
