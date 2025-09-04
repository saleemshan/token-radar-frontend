'use client';
import { useUser } from '@/context/UserContext';
// import { chains } from '@/data/default/chains';
import useUserFavouriteTokensData from '@/hooks/data/useUserFavouriteTokensData';
import useIsMobile from '@/hooks/useIsMobile';
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image';
import { getReadableNumber } from '@/utils/price';
import { getTokenUrl } from '@/utils/url';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';
// import Marquee from 'react-fast-marquee';

const FavouriteTokensMarquee = () => {
  const { chain } = useUser();
  const { data } = useUserFavouriteTokensData(chain.api);
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // const getTokenSymbol = (chain: ChainId) => {
  //   const newChain = chains.find((data) => data.id === chain);

  //   if (newChain) {
  //     return newChain.symbol;
  //   }
  //   return '';
  // };

  if (pathname.includes('/referral')) {
    return null; // Hide the component
  }

  return (
    <>
      <div className="w-full h-8 border rounded-lg border-border relative overflow-hidden">
        <div className="absolute left-0 inset-y-0 bg-black border-r border-border flex h-full items-center justify-center z-10 px-4 rounded-l-lg w-24">
          Favourites
        </div>
        <div className="w-full py-1 flex flex-nowrap mobile-no-scrollbar no-scrollbar items-center h-8 overflow-x-auto pl-24">
          {data &&
            data.length > 0 &&
            data.map((data, index) => {
              if (data.name) {
                return (
                  <Link
                    key={index}
                    href={getTokenUrl(data.chain, data.address, isMobile)}
                    className="flex gap-1 items-center px-1 select-none"
                  >
                    <div className="bg-black min-w-4 min-h-4 max-w-4 max-h-4 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                      {data.logo && data.logo.includes('https') && (
                        <Image
                          src={data.logo ?? TOKEN_PLACEHOLDER_IMAGE}
                          alt={`${data.name} logo`}
                          width={200}
                          height={200}
                          className="rounded-full"
                        />
                      )}
                    </div>
                    <span className="text-[11px] font-semibold mt-[0px] break-keep text-nowrap">
                      {`${data.symbol}`}
                    </span>

                    <span
                      className={`text-2xs rounded px-1 mb-[] ${
                        data.priceChange24h > 0
                          ? 'text-positive bg-positive/10'
                          : data.priceChange24h < 0
                          ? 'text-negative bg-negative/10'
                          : 'text-neutral-text'
                      }`}
                    >
                      {getReadableNumber(data.priceChange24h, 1)}%
                    </span>
                  </Link>
                );
              }
            })}
        </div>
      </div>
    </>
  );
};

export default FavouriteTokensMarquee;
