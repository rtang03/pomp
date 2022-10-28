export * from './Metadata';
export * from './MissionDocument';
export * from './PompContractStruct';
export * from './UserProfile';

import { ParsedUrlQuery } from 'querystring';
import type { PropsWithChildren } from 'react';

export type WithChildren<T = {}> = T & PropsWithChildren<{}>;

export type WithClassName<T = {}> = T & {
  className?: string;
};

export type SiteProps = {
  stringifiedData: string;
};

export interface PathProps extends ParsedUrlQuery {
  id?: string;
  handle?: string;
}
