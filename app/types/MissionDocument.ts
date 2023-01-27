import type { DocumentData } from '@firebase/firestore';

export interface MissionDocument extends DocumentData {
  content?: string;
  createdAt?: number;
  description?: string;
  enddate?: any;
  id?: string;
  image?: string;
  imageBlurhash?: string;
  imageType?: string;
  slug?: string;
  startdate?: any;
  status: string;
  title?: string;
  uid?: string;
  updatedAt?: number;
  wallet?: string;
}

export const isMissionDocument = (input: any): input is MissionDocument =>
  input.createdAt !== undefined && input.status !== undefined && input.wallet !== undefined;

export const isMissionDocuments = (input: any): input is MissionDocument[] =>
  Array.isArray(input) &&
  input.map((item) => isMissionDocument(item)).reduce((prev, curr) => prev && curr, true);
