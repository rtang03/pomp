'use client';

import { nanoid } from 'nanoid';

import type { Metadata } from '@/types/Metadata';
import { elog } from '@/utils/consoleLog';

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJSEC;

export const uploadMetadataToIPFS: (data: Metadata) => Promise<{ ipfsUrl: string | null }> = async (
  data
) => {
  const metadata = {
    ...data,
    metadata_id: nanoid(),
    version: '1.0.0'
  };

  const option: RequestInit = {
    method: 'POST',
    body: JSON.stringify(metadata),
    headers: {
      authorization: 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
    }
  };

  try {
    const cid = await fetch('https://ipfs.infura.io:5001/api/v0/add', option)
      .then((res) => res.json())
      .then((json) => json?.Hash);

    if (cid) return { ipfsUrl: `ipfs://${cid}` };
    else elog('[utils/uploadMetaToIPFS] IPFS-client', 'unknown ipfs-add error');
  } catch (error) {
    elog('[utils/uploadMetaToIPFS] IPFS-client', error);
  }

  return { ipfsUrl: null };
};
