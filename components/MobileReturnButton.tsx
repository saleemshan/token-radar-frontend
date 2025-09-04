'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaChevronLeft } from 'react-icons/fa6';

const MobileReturnButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) => {
  const router = useRouter();

  const handleReturnClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  return (
    <div className="flex md:hidden  items-center gap-3">
      <button
        type="button"
        onClick={() => {
          if (onClick) {
            onClick();
          } else {
            handleReturnClick();
          }
          // setShowSearchPanel(!showSearchPanel);
        }}
        className={`flex md:hidden bg-table-odd border border-border rounded-lg px-2 gap-2 w-7 min-w-7 h-7  min-h-7 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text `}
      >
        <FaChevronLeft className="block " />
      </button>
      <div className=" text-sm font-semibold leading-6 text-white  bg-black">
        {label}
      </div>
    </div>
  );
};

export default MobileReturnButton;
