'use client';

import { NextSeo } from 'next-seo';
import { OpenGraphMedia, OpenGraphProfile } from 'next-seo/lib/types';
import { type FC } from 'react';
import { BRAND_IMAGE, OG_DESCRIPTION, OG_URL } from 'src/constants';

export const PageSEO: FC<{ title: string; description: string; imageUrl: string }> = ({
  imageUrl,
  title,
  description
}) => {
  const image: OpenGraphMedia = {
    url: imageUrl ?? BRAND_IMAGE,
    type: 'image/*'
  };

  return (
    <NextSeo
      useAppDir
      title={title}
      openGraph={{
        type: 'website',
        url: OG_URL,
        locale: 'en_IE',
        site_name: 'Proof of mission protocol',
        description: description || OG_DESCRIPTION,
        images: image ? [image] : []
      }}
      twitter={{
        handle: '@madseedxyz',
        site: '@madseedxyz',
        cardType: 'summary_large_image'
      }}
    />
  );
};

export const AchievementSEO: FC<{ handle: string; imageUrl: string; description: string }> = ({
  imageUrl,
  handle,
  description
}) => {
  const image: OpenGraphMedia = {
    url: imageUrl ?? BRAND_IMAGE,
    type: 'image/*'
  };
  const profile: OpenGraphProfile = { username: handle };

  return (
    <NextSeo
      useAppDir
      title={`${handle}🌼Pomp`}
      openGraph={{
        type: 'profile',
        url: OG_URL,
        locale: 'en_IE',
        site_name: 'Proof of mission protocol',
        description: description || OG_DESCRIPTION,
        images: image ? [image] : [],
        profile
      }}
      twitter={{
        handle: '@madseedxyz',
        site: '@madseedxyz',
        cardType: 'summary_large_image'
      }}
    />
  );
};
