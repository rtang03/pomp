'use client';

import { useTheme } from 'next-themes';
import { type FC, useEffect, useState } from 'react';
import { BsSun } from 'react-icons/bs';
import { MdOutlineDarkMode } from 'react-icons/md';

import MotionToggle from './MotionToggle';

// see https://github.com/WITS/next-themes#avoid-hydration-mismatch

const ToggleThemeButton: FC<{ theme: string }> = ({ theme }) => {
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  const Button1 = () => (
    <button onClick={() => setTheme('light')}>
      <MdOutlineDarkMode className="text-2xl" />
    </button>
  );

  const Button2 = () => (
    <button onClick={() => setTheme('dark')}>
      <BsSun className="text-2xl" />
    </button>
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <MotionToggle
      firstContent={theme === 'dark' ? <Button1 /> : <Button2 />}
      secondContent={theme === 'light' ? <Button2 /> : <Button1 />}
    />
  );
};
export default ToggleThemeButton;
