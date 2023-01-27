'use client';

import { useTheme } from 'next-themes';
const ThemeButton = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <button
        onClick={() => {
          setTheme('light');
        }}
      >
        light
      </button>
      <button
        onClick={() => {
          setTheme('dark');
        }}
      >
        dark
      </button>
    </>
  );
};

export default ThemeButton;
