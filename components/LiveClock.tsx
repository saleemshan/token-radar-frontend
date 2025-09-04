'use client';
import { useState, useEffect } from 'react';

const LiveClock = ({ timezone = 'UTC', className = '' }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // 24-hour format
      });
      const now = new Date();
      setCurrentTime(formatter.format(now));
    };

    updateClock(); // Update immediately
    const intervalId = setInterval(updateClock, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup
  }, [timezone]);

  return <div className={className}>{currentTime}</div>;
};

export default LiveClock;
