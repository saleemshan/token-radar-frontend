import { useState, useLayoutEffect } from 'react';

const useScreenWidth = (): number => {
  const [width, setWidth] = useState<number>(1920);

  // Use `useLayoutEffect` to perform side effects after the layout is rendered
  useLayoutEffect(() => {
    if (window) {
      setWidth(window.innerWidth);
    }
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
};

export default useScreenWidth;
