import { useEffect } from 'react';

const useTooltip = () => {
  useEffect(() => {
    const showTooltip = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !(target instanceof HTMLElement)) return;

      const tooltipText = target.getAttribute('data-tooltip');
      if (!tooltipText) return;

      const tooltipElement = document.createElement('div');
      tooltipElement.className = 'custom-tooltip';
      tooltipElement.textContent = tooltipText;
      document.body.appendChild(tooltipElement);

      // Calculate tooltip position
      const { top, left, height } = target.getBoundingClientRect();
      tooltipElement.style.opacity = '1';

      // Position the tooltip initially below the target element
      let tooltipTop = top + height + window.scrollY;
      let tooltipLeft = left + window.scrollX;

      // Adjust for overflow on the right
      const viewportWidth = window.innerWidth;
      const tooltipWidth = tooltipElement.offsetWidth;
      if (tooltipLeft + tooltipWidth > viewportWidth) {
        tooltipLeft = viewportWidth - tooltipWidth - 10; // 10 for padding
      }

      // Adjust for overflow on the bottom
      const viewportHeight = window.innerHeight;
      const tooltipHeight = tooltipElement.offsetHeight;
      if (tooltipTop + tooltipHeight > viewportHeight) {
        tooltipTop = top - tooltipHeight + window.scrollY - 10; // 10 for padding
      }

      tooltipElement.style.top = `${tooltipTop}px`;
      tooltipElement.style.left = `${tooltipLeft}px`;

      const removeTooltip = () => {
        tooltipElement.remove();
      };
      target.addEventListener('mouseleave', removeTooltip, { once: true });
    };

    document.addEventListener('mouseover', showTooltip, { capture: true });

    return () => {
      document.removeEventListener('mouseover', showTooltip, { capture: true });
    };
  }, []);
};

export default useTooltip;
