export enum MetadataDisplayType {
  number = 'number',
  string = 'string',
  date = 'date'
}

export type MetadatAttribute = {
  display_type?: MetadataDisplayType;
  trait_type?: string;
  value: string | number;
};

export type MimeType =
  | 'image/gif'
  | 'image/jpeg'
  | 'image/png'
  | 'image/tiff'
  | 'image/x-ms-bmp'
  | 'image/svg+xml'
  | 'image/webp'
  | 'video/webm'
  | 'video/mp4'
  | 'video/x-m4v'
  | 'video/ogv'
  | 'video/ogg'
  | 'audio/wav'
  | 'audio/mpeg'
  | 'audio/ogg';

export interface MetadataMedia {
  item: string;
  type?: MimeType | null;
  altTag?: string | null;
  cover?: string | null;
}
export type Metadata = {
  animation_url?: string;
  attributes?: MetadatAttribute[];
  content?: string;
  description?: string;
  external_url?: string;
  locale?: 'en';
  image?: string;
  imageMimeType?:
    | 'image/gif'
    | 'image/jpeg'
    | 'image/png'
    | 'image/x-ms-bmp'
    | 'image/svg+xml'
    | 'image/webp';
  media?: MetadataMedia[];
  metadata_id?: string;
  name: string;
  tags?: string[];
  version?: string;
};

export const isMetadata = (input: any): input is Metadata =>
  input?.name !== undefined && input?.metadata_id !== undefined;

export const getAttributebyTraitType = (
  attributes: Metadata['attributes'] | undefined,
  query: 'mission_slug' | 'end_date' | 'title' | 'start_date'
): string | number | undefined => {
  return attributes?.find((o) => o.trait_type === query)?.value;
};
