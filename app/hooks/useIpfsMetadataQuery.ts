'use client';

import { useAppContext } from '@components/AppContext';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';

import { isMetadata, Metadata } from '@/types/Metadata';
import { elog, log } from '@/utils/consoleLog';

const LABEL = '[useIpfsMetadataQuery]';

const fetchUriFunction = async ({ queryKey }: QueryFunctionContext) => {
  const [_key, uri] = queryKey;
  if (!uri) return Promise.resolve(null);

  const response = await fetch(uri as any);
  if (!response.ok) {
    elog(`fail to fetch [$_key]`, await response.text());
    throw new Error('fail to fetch uri');
  }
  return response.json();
};

const useIpfsMetadataQuery = (uri?: string) => {
  const { dev } = useAppContext();
  const result = useQuery<Metadata | null>(['tokenURI', uri], fetchUriFunction, {
    enabled: uri?.startsWith('http'),
    select: (data) => {
      if (isMetadata(data)) return data;
      elog(LABEL, data);
      return null;
    },
    onSuccess: (data) => dev && log(LABEL, data),
    onError: (error) => elog(LABEL, error),
    staleTime: Infinity,
    cacheTime: Infinity
  });
  const metadata = result?.data;
  const metadataError = result?.error;

  return { ...result, metadataError, metadata };
};

export default useIpfsMetadataQuery;
