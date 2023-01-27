'use client';

import cn from 'clsx';
import Image from 'next/image';
import { type ComponentProps, useState } from 'react';

export type WithClassName<T = {}> = T & {
  className?: string;
};

interface BlurImageProps extends WithClassName, ComponentProps<typeof Image> {
  alt: string;
}

export default function BlurImage(props: BlurImageProps) {
  const [isLoading, setLoading] = useState(true);

  return (
    <Image
      {...props}
      alt={props.alt}
      className={cn(
        props.className,
        'duration-700 ease-in-out',
        isLoading ? 'grayscale blur-2xl scale-110' : 'grayscale-0 blur-0 scale-100'
      )}
      onLoadingComplete={() => setLoading(false)}
      fill
      sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
      style={{ objectFit: 'cover' }}
    />
  );
}
