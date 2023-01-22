import Link from 'next/link';

import AccountButtonGroup from './AccountButtonGroup';

const NavBar = () => (
  <>
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
    {/*<div className="flex justify-center border-b border-gray-500/50"></div>*/}
  </>
);

export default NavBar;
