import type { QueryFunctionContext } from '@tanstack/react-query';
import { elog } from '@utils/consoleLog';

export const fetchUriFunction = async ({ queryKey }: QueryFunctionContext) => {
  const [_key, uri] = queryKey;
  if (!uri) return Promise.resolve(null);

  const response = await fetch(uri as any);
  if (!response.ok) {
    elog(`fail to fetch [$_key]`, await response.text());
    throw new Error('fail to fetch uri');
  }
  return response.json();
};

export {};
