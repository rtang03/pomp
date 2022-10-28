import { useAppContext } from '@components/AppContext';
import { useQuery } from '@tanstack/react-query';
import { elog, log } from '@utils/consoleLog';
import { fetchUriFunction } from '@utils/fetchFunction';
import { isMetadata, Metadata } from 'src/types';

const LABEL = '[useIpfsMetadataQuery]';

export const useIpfsMetadataQuery = (uri: string) => {
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
