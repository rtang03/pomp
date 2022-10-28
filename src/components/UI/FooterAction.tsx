import { type FC, type ReactNode } from 'react';

type Props = {
  leftContent: ReactNode;
  rightContent: ReactNode;
};

const FooterAction: FC<Props> = ({ leftContent, rightContent }) => {
  return (
    <footer className="z-5 fixed inset-x-0 bottom-0 z-20 h-36 border-t border-solid border-gray-500 bg-white dark:bg-gray-900 md:h-20">
      <div className="mx-auto block h-full max-w-screen-xl items-center justify-between space-y-5 px-10 sm:px-20 md:flex">
        <div>{leftContent}</div>
        <div>{rightContent}</div>
      </div>
    </footer>
  );
};

export default FooterAction;
