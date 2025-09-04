'use client';
import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  className,
}) => {
  // State to manage the open/close state of the accordion
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the accordion state
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`flex flex-col border border-border rounded-lg ${className}`}
    >
      <div
        className="flex items-center justify-between gap-1 cursor-pointer p-3"
        onClick={toggleAccordion}
      >
        <span className="">{title}</span>
        <FaChevronDown
          className={` transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>
      {isOpen && <div className="border-t border-border">{children}</div>}
    </div>
  );
};

export default Accordion;
