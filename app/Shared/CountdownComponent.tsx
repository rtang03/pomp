'use client';

import type { FC } from 'react';
import Countdown from 'react-countdown';

type Props = { date: number };

const padWithZero = (num: number) => String(num).padStart(2, '0');

const CountDownComponent: FC<Props> = ({ date }) => (
  <Countdown
    date={date}
    renderer={(props) =>
      props.completed ? (
        <div>Mission Ended</div>
      ) : (
        <div className="font-mono">
          {props.days > 0 ? `${padWithZero(props.days)} Days ` : ''}
          {padWithZero(props.hours)}:{padWithZero(props.minutes)}:{padWithZero(props.seconds)}
        </div>
      )
    }
  />
);

export default CountDownComponent;
