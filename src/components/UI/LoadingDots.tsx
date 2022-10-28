import { useTheme } from 'next-themes';

import styles from './loading-dots.module.css';

type LoadingDotsProps = {
  color?: string;
};

const LoadingDots = ({ color }: LoadingDotsProps) => {
  const { theme } = useTheme();
  if (!color) {
    color = theme === 'light' ? '#000' : '#fff';
  }

  return (
    <span className={styles.loading}>
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
      <span style={{ backgroundColor: color }} />
    </span>
  );
};

export default LoadingDots;
