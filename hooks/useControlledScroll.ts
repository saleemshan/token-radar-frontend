import { useEffect, MutableRefObject } from 'react';

type UseControlledScrollProps = {
  ref: MutableRefObject<HTMLElement | null>;
};

const useControlledScroll = ({ ref }: UseControlledScrollProps) => {
  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.pageX;
      startY = touch.pageY;
      scrollLeft = element.scrollLeft;
      scrollTop = element.scrollTop;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const xDiff = touch.pageX - startX;
      const yDiff = touch.pageY - startY;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        // Horizontal move
        e.preventDefault(); // Prevent vertical scrolling
        element.scrollLeft = scrollLeft - xDiff;
      } else {
        // Vertical move
        e.preventDefault(); // Prevent horizontal scrolling
        element.scrollTop = scrollTop - yDiff;
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [ref]);
};

export default useControlledScroll;
