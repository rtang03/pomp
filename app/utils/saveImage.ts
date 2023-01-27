import { decode } from 'blurhash';
import type { Dispatch, SetStateAction } from 'react';

import type { MissionData } from '@/types/MissionData';
import { IPFS_DEDICATED_GATEWAY } from '@/utils/constants';

async function saveImage<U extends MissionData>(
  imageUrl: string,
  imageType: string,
  data: U,
  setData: Dispatch<SetStateAction<U>>
): Promise<void> {
  try {
    const dedicatedGateway = imageUrl.replace('https://ipfs.io/ipfs', IPFS_DEDICATED_GATEWAY);
    const res = await fetch(`/api/blurhash?url=${dedicatedGateway}`);

    if (res.status === 200) {
      const blurhash = await res.json();

      const pixels = decode(blurhash.hash, 32, 32);
      const image = getImgFromArr(pixels, 32, 32);

      setData({
        ...data,
        image: dedicatedGateway,
        imageBlurhash: image.src,
        imageType
      });
    } else setData({ ...data, image: imageUrl, imageType });
  } catch (error) {
    console.error(error);
  }
}

export default saveImage;

/**
 * Get Image from Array
 *
 * Convert an Uint8ClampedArray to an image.
 *
 * TypeScript port of `array-to-image`.
 * @see https://github.com/vaalentin/array-to-image
 *
 * @param {Uint8ClampedArray} arr - Uint array of image data
 * @param {number} width - Width of the image
 * @param {number} height - Height of the image
 *
 * @returns
 */
export function getImgFromArr(
  arr: Uint8ClampedArray,
  width: number,
  height: number
): HTMLImageElement {
  if (typeof width === 'undefined' || typeof height === 'undefined') {
    width = height = Math.sqrt(arr.length / 4);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  if (ctx) {
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(arr);
    ctx.putImageData(imgData, 0, 0);
  }

  const img = document.createElement('img');
  img.src = canvas.toDataURL();

  return img;
}
