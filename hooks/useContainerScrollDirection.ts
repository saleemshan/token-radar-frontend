import { useState, useEffect, RefObject } from 'react';

const useContainerScrollDirection = (
  containerRef: RefObject<HTMLElement>,
  debounce: number = 200,
) => {
  const [scrollDirection, setScrollDirection] = useState<
    'up' | 'down' | undefined
  >(undefined);
  const [lastScrollTop, setLastScrollTop] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        const scrollTop = container.scrollTop;
        if (scrollTop > lastScrollTop) {
          setScrollDirection('down');
        } else {
          setScrollDirection('up');
        }
        setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
      }, debounce);
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [containerRef, lastScrollTop, debounce]);

  return scrollDirection;
};

export default useContainerScrollDirection;
