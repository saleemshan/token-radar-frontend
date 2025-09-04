'use client';
import MobileSearchTokenForm from '@/components/forms/MobileSearchTokenForm';
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom';
import React from 'react';

const WalletPage = () => {
  usePreventZoomOnMobile();
  return (
    <div className="w-full md:w-auto h-full overflow-hidden flex flex-col fixed inset-0 bg-black z-[101]">
      <MobileSearchTokenForm />
    </div>
  );
};

export default WalletPage;
