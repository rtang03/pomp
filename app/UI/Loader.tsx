import { type FC } from 'react';

const Loader: FC<{ className?: string }> = ({ className = 'h-screen' }) => {
  const circleCommonClasses = 'h-4 w-4 bg-black dark:bg-white rounded-full';

  return (
    <div className={`flex ${className}`}>
      <div className="m-auto flex">
        <div className={`${circleCommonClasses} mr-2 animate-bounce`}></div>
        <div className={`${circleCommonClasses} animate-bounce200 mr-2`}></div>
        <div className={`${circleCommonClasses} animate-bounce400`}></div>
      </div>
    </div>
  );
};

export default Loader;
