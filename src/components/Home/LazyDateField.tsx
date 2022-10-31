import { type FC } from 'react';

type Props = {
  date: string;
};

const LazyDateField: FC<Props> = ({ date }) => {
  return <>{date}</>;
};

export default LazyDateField;
