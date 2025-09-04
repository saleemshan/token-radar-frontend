import { useEffect, useState } from 'react';

const usePageFocus = (): boolean => {
  const [isFocused, setIsFocused] = useState(
    document.visibilityState === 'visible',
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsFocused(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isFocused;
};

export default usePageFocus;
