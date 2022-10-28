import { motion } from 'framer-motion';
import Link from 'next/link';
import { GiSpiderWeb, GiWaterDivinerStick, GiWoodStick, GiWorriedEyes } from 'react-icons/gi';

export default function Custom404() {
  return (
    <div className="flex-col">
      <div className="py-10 text-center">
        <div className="container flex justify-center">
          <GiWoodStick className="h-64 w-64 scale-x-150 text-green-700 dark:text-green-900/90" />
          <GiSpiderWeb className="h-48 w-48 scale-x-150 text-teal-700 dark:text-teal-900/90" />
          <GiWaterDivinerStick className="h-64 w-64 scale-x-150 text-green-700 dark:text-green-900/90" />
        </div>
        <div className="-mt-36 flex justify-center">
          <GiWorriedEyes className="h-36 w-36 animate-pulse text-red-700/90" />
        </div>
        <h1 className="mb-4 text-3xl font-bold">404 ERROR</h1>
        <h2 className="mb-4 text-2xl font-bold">Oops! Looks like you 've get Lost‽</h2>
        <div className="mb-2">This page you 're looking for doesn't exist or has been moved.</div>
        <div className="mb-8">Go back home, and log in again.</div>
        <Link href="/" passHref>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="h-12 w-48 rounded-full border-2 border-red-500 hover:border-blue-700 dark:hover:border-white"
          >
            <a>BACK HOME</a>
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
