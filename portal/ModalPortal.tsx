import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({
  children,
  targetId,
}: {
  children: React.ReactNode;
  targetId: string;
}) => {
  const targetElementRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElementRef.current = targetElement;
    }
    return () => {
      targetElementRef.current = null;
    };
  }, [targetId]);

  if (!targetElementRef.current) {
    // console.warn('Portal has no children to render.');
    return null;
  }

  if (!children) {
    // console.warn('Portal has no children to render.');
    return null;
  }

  return createPortal(children, targetElementRef.current);
};

export default Portal;
