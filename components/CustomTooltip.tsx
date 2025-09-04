'use client';
import React, { useState, useRef, useLayoutEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: ReactNode;
  icon: ReactNode;
  padding?: boolean;
  maxWidth?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  children,
  icon,
  padding = true,
  maxWidth = 'max-w-40 ',
}) => {
  const [visible, setVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const toggleTooltip = () => {
    setVisible((prev) => !prev);
  };

  useLayoutEffect(() => {
    if (visible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spaceAbove = containerRect.top;
      // const spaceBelow = window.innerHeight - containerRect.bottom;

      let top: number;
      let left =
        containerRect.left +
        containerRect.width / 2 -
        tooltipRect.width / 2 +
        window.scrollX;

      // Determine tooltip vertical position with sufficient space
      if (spaceAbove > tooltipRect.height + 8) {
        top = containerRect.top - tooltipRect.height - 8 + window.scrollY;
      } else {
        top = containerRect.bottom + 8 + window.scrollY;
      }

      // Ensure the tooltip doesn't overflow horizontally
      left = Math.max(
        8,
        Math.min(left, window.innerWidth - tooltipRect.width - 8),
      );

      setTooltipPos({ top, left });
    }
  }, [visible]);

  return (
    <div
      onMouseEnter={toggleTooltip}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={toggleTooltip} // Handle touch interactions
      ref={containerRef}
      className="relative"
    >
      {icon}
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`rounded-md break-words overflow-hidden bg-black border border-border text-neutral-text text-2xs absolute z-[5001] pointer-events-auto leading-tight ${
              padding ? 'px-2 py-1 ' : ''
            } ${maxWidth}`}
            style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default CustomTooltip;
