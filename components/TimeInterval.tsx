'use client';

import React, { useEffect, useState } from 'react';

const TimeInterval = ({
  className,
  initialTime,
  position = 'absolute',
  timezone = 'UTC',
}: {
  className?: string;
  position?: string;
  initialTime: string;
  timezone?: string;
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const getTimezoneDate = (date: Date, timeZone: string) => {
      return new Date(date.toLocaleString('en-US', { timeZone }));
    };

    const updateTimeAgo = () => {
      const now = new Date();
      const nowInTz = getTimezoneDate(now, timezone);
      const thenInTz = getTimezoneDate(new Date(initialTime), timezone);

      const seconds = Math.floor(
        (nowInTz.getTime() - thenInTz.getTime()) / 1000,
      );

      const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1,
      };

      // Handle time differences less than an hour
      if (seconds < intervals.hour) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes === 0) {
          if (remainingSeconds < 5) {
            setTimeAgo('Just now');
            return;
          }
          setTimeAgo(`${remainingSeconds}s ago`);
          return;
        }

        setTimeAgo(`${minutes}m ${remainingSeconds}s ago`);
        return;
      }

      // Handle time differences less than a day
      if (seconds < intervals.day) {
        const hours = Math.floor(seconds / intervals.hour);
        setTimeAgo(`${hours}h ago`);
        return;
      }

      // Handle other time intervals
      for (const [name, secondsInInterval] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInInterval);

        if (interval >= 1) {
          // For weeks, convert to days if less than 2 weeks
          if (name === 'week' && interval === 1) {
            setTimeAgo(`${Math.floor(seconds / intervals.day)}d ago`);
            return;
          }

          setTimeAgo(`${interval}${name[0]} ago`);
          return;
        }
      }
    };

    updateTimeAgo();
    const intervalId = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(intervalId);
  }, [initialTime, timezone]);

  return (
    <div
      className={
        className
          ? className
          : `text-2xs text-neutral-text-dark text-right min-w-fit leading-none ${position} -top-[4px] -right-[4px]`
      }
    >
      {timeAgo}
    </div>
  );
};

export default TimeInterval;
