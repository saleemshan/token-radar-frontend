'use client';
import { useUser } from '@/context/UserContext';
import React, { useEffect, useState } from 'react';
import AlphaFeedPanel from './AlphaFeedPanel';
import useIsMobile from '@/hooks/useIsMobile';
import FavouritesPanel from './FavouritesPanel';
import { usePathname } from 'next/navigation';
import useScreenWidth from '@/hooks/useScreenWidth';

const SideWrapper = () => {
  const { showAlphaFeed, showFavouritesPanel } = useUser();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const screenWidth = useScreenWidth();
  const [showPanel, setShowPanel] = useState(
    pathname === '/' ||
      pathname === '/new-pairs' ||
      (pathname.includes('tokens') && pathname.includes('mobile')),
  );

  useEffect(() => {
    setShowPanel(
      pathname === '/' ||
        pathname === '/new-pairs' ||
        (pathname.includes('tokens') && pathname.includes('mobile')) ||
        (pathname.includes('tokens') && screenWidth < 1280),
    );
  }, [screenWidth, pathname]);

  return (
    <>
      {showPanel && (showAlphaFeed || showFavouritesPanel) && (
        //     <div
        //   className={`fixed lg:relative inset-0 lg:mr-3 rounded-lg z-[51]  md:z-[50] flex flex-col gap-3 overflow-hidden w-auto pointer-events-none ${
        //     isMobile ? '' : 'p-3'
        //   } lg:p-0 mb-[4.65rem] md:mb-0 `}
        // >
        <div
          className={`fixed lg:relative inset-0 lg:mr-3 md:rounded-lg z-[101]  md:z-[50] flex flex-col gap-3 overflow-hidden w-auto pointer-events-none ${
            isMobile ? '' : 'p-3'
          } lg:p-0 md:mb-0 `}
        >
          {showAlphaFeed && (
            <div className={`flex-1 overflow-hidden w-full lg:w-[22rem] `}>
              <AlphaFeedPanel />
            </div>
          )}
          {showFavouritesPanel && (
            <div className={`flex-1 overflow-hidden w-full lg:w-[22rem] `}>
              <FavouritesPanel />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SideWrapper;
