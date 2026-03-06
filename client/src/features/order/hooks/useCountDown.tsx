import { useEffect, useState } from 'react';

const useCountDown = (date: string): number[] => {
  const targetDate: number = Date.parse(date);
  const now: number = Date.parse(`${new Date()}`);

  const [countDown, setCountDown] = useState<number>(targetDate - now);

  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setCountDown(targetDate - Date.parse(`${new Date()}`));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return getTimeValues(countDown);
};

const getTimeValues = (diff: number): number[] => {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export default useCountDown;
