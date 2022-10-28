import Account from '@components/Account';
import { useAppContext } from '@components/AppContext';
import { shortenAddress } from '@utils/shortenAddress';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { type FC } from 'react';

const ThemeButton = dynamic(() => import('@components/UI/ToggleThemeButton'), { ssr: false });

const Navbar: FC = () => {
  const { theme } = useTheme();
  const { isValidWalletAccount, user } = useAppContext();

  return (
    <header>
      <nav className="top-navigation h-20">
        <div className="flex flex-1 justify-start px-2 md:px-0">
          <Link href={'/'}>
            <a>Home</a>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-5">
          <ThemeButton theme={theme as string} />
          <Account />
        </div>
      </nav>
      {!isValidWalletAccount && user?.displayName && (
        <div className="fixed top-0 -z-10 flex w-full justify-center">
          <div className="h-16 w-96 rounded-b-2xl border-x-2 border-b-2 border-gray-500/50 px-2 text-center opacity-50">
            You need to switch to {shortenAddress(user.displayName)} in supported chain; or login
            again with new address.
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
