import { motion } from 'framer-motion';
import Link from 'next/link';
import { GiTwister } from 'react-icons/gi';

export default function Custom500() {
  return (
    <div className="flex-col">
      <div className="py-10 text-center">
        <div className="flex justify-center">
          <GiTwister className="h-32 w-32 animate-pulse text-red-700" />
        </div>
        <h1 className="mb-4 text-3xl font-bold">500 ERROR</h1>
        <h2 className="mb-4 text-2xl font-bold">Oops! Our service is down</h2>
        <div className="mb-2">Even the bots aren't sure what happened, but we'll look into it.</div>
        <div className="mb-8">Go back home, and log in again.</div>
        <Link href="/" passHref>
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="h-12 w-48 rounded-full border-2 border-red-500 hover:border-blue-700 dark:hover:border-white"
          >
            BACK HOME
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
