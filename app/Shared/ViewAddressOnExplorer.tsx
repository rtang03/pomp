'use client';

import { type FC } from 'react';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { useNetwork } from 'wagmi';

import { getExplorer } from '@/utils/networkConfig';
import { shortenTx } from '@/utils/shortenAddress';

type Props = {
  hash: string;
  kind?: 'tx' | 'address';
  size?: 'base' | 'sm';
  chars?: number;
};

const ViewAddressOnExplorer: FC<Props> = ({ hash, kind = 'tx', size = 'sm', chars = 4 }) => {
  const { chain } = useNetwork();
  const explorerURL = chain && getExplorer(chain.id.toString());

  return (
    <div className="inline-block">
      {explorerURL && (
        <div>
          <a
            className="link-text-no-underline"
            target="_blank"
            rel="noreferrer"
            href={`${explorerURL}/${kind}/${hash}`}
          >
            <div className="flex space-x-2">
              <div className={`text-${size}`}>{shortenTx(hash, chars)}</div>
              <BsBoxArrowUpRight className="h-4 w-4" />
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default ViewAddressOnExplorer;
