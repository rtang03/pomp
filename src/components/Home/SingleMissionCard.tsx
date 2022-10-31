import BlurImage from '@components/UI/BlurImage';
import { Card } from '@components/UI/Card';
import { formatDate } from '@utils/formatter';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { type FC } from 'react';
import type { MissionDocument } from 'src/types';

type Props = {
  mission: MissionDocument;
};

const LazyDateField = dynamic(() => import('@components/Home/LazyDateField'), { ssr: false });
const CountdownComponent = dynamic(() => import('@components/Shared/CountdownComponent'), {
  ssr: false
});

const SingleMissionCard: FC<Props> = ({ mission: m }) => {
  const isMissionEnded = m.enddate.seconds < Math.floor(Date.now() / 1000);

  return (
    <Card className="w-full md:p-5">
      <div className="block justify-between space-y-2 md:flex md:space-x-5">
        <div className="block overflow-hidden md:flex md:space-x-5">
          <div className="w-full md:w-32">
            {m.image ? (
              <div>
                <BlurImage
                  width={100}
                  height={100}
                  layout="responsive"
                  alt={m.title ?? 'Unknown Thumbnail'}
                  objectFit="cover"
                  src={m.image}
                  blurDataURL={m.imageBlurhash as string}
                  placeholder="blur"
                />
              </div>
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-gray-100 text-2xl text-gray-500 md:h-full">
                No cover
              </div>
            )}
          </div>
          <div className="flex-col p-2">
            <Link href={`/m/${m.slug}`}>
              <a className="text-xl text-blue-500 line-clamp-1">
                <motion.button whileTap={{ scale: 0.95 }} type="button">
                  {m.title || 'No Title'}
                </motion.button>
              </a>
            </Link>
            <div className="title-text line-clamp-3">{m.description || 'No description'}</div>
            {/* hit this issue https://github.com/vercel/next.js/discussions/39425 */}
            {/* Todo: Comment out Date field for now */}
            <div className="text-sm">
              {m.updatedAt && (
                <span className="italic">
                  <LazyDateField date={formatDate(m.updatedAt)} />
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-col p-2 md:space-y-6">
          <div className="text-left font-bold md:text-right">End time</div>
          {isMissionEnded ? (
            <div>Mission Ended</div>
          ) : (
            <CountdownComponent date={m.enddate.seconds * 1000} />
          )}
        </div>
      </div>
    </Card>
  );
};

export default SingleMissionCard;
