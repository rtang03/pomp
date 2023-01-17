import Link from 'next/link';

import AccountButtonGroup from './AccountButtonGroup';
const NavBar = () => {
  return (
    <header>
      <nav className="top-navigation h-20">
        <div className="flex flex-1 justify-start px-2 md:px-0">
          <Link href={'/'}>Home</Link>
        </div>
        <div className="flex items-center justify-end space-x-5">
          <AccountButtonGroup />
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
