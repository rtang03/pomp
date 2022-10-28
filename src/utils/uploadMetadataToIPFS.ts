import { elog } from '@utils/consoleLog';
import { type Options, create } from 'ipfs-http-client';
import { nanoid } from 'nanoid';

import type { Metadata } from '../types';

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
  const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
  const option: Options = {
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: { authorization: auth }
  };
  const client = create(option);

  try {
    const cid = await client.add(JSON.stringify(metadata));

    if (cid?.path) return { ipfsUrl: `ipfs://${cid.path}` };
    else elog('[utils/uploadMetaToIPFS] IPFS-client', 'unknown ipfs-add error');
  } catch (error) {
    elog('[utils/uploadMetaToIPFS] IPFS-client', error);
  }

  return { ipfsUrl: null };
};
