'use client';

import { useUser } from '@/context/UserContext';
import { chains } from '@/data/default/chains';
import { getSlicedAddress } from '@/utils/crypto';
import { getChainImage, getTokenImage } from '@/utils/image';
import { getReadableNumber } from '@/utils/price';
import { saveTokenSearchHistory } from '@/utils/tokenSearch';
import { getTokenUrl } from '@/utils/url';
import Image from 'next/image';
import Link from 'next/link';

import React from 'react';

const SearchTokenItem = ({
  token,
  handleBlurSearchInput,
  isMobile = false,
}: {
  token: Token;
  handleBlurSearchInput: () => void;
  isMobile: boolean;
}) => {
  const { chain, setChain, setLastSelectedToken } = useUser();
  // const router = useRouter();
  return (
    <Link
      key={token.id}
      className="flex items-center p-3 hover:bg-table-odd bg-table-even apply-transition gap-4 w-full"
      onClick={() => {
        saveTokenSearchHistory({
          chain: token.chain_id,
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          logo: token.image.icon,
        });

        const tokenChainId = token.chain_id;
        if (tokenChainId !== chain.id) {
          const newChain = chains.find((c) => c.id === tokenChainId);

          if (newChain) setChain(newChain);
        }

        handleBlurSearchInput();
        setLastSelectedToken({
          address: token.address,
          chain: token.chain_id,
        });

        // router.push(getTokenUrl(token.chain_id, token.address));
      }}
      href={getTokenUrl(token.chain_id, token.address, isMobile)}
      passHref
    >
      <div className="relative">
        <div className="min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border  relative flex items-center justify-center overflow-hidden">
          <Image
            src={getTokenImage(token)}
            alt={`${token.name} logo`}
            width={200}
            height={200}
            className="rounded-full"
          />
        </div>
        <div className="absolute w-[16px] h-[16px] min-w-[16px] min-h-[16px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
          <Image
            src={getChainImage(token.chain_id)}
            alt={`${token.name} logo`}
            width={100}
            height={100}
            className=" w-full h-full object-cover object-center"
          />
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col gap-1  overflow-hidden justify-center w-full">
          <div className="flex items-center gap-2">
            <div className="font-bold  text-white text-xs text-ellipsis  whitespace-nowrap">
              {token.symbol}
            </div>
            <div className="text-2xs  text-neutral-500">
              {getSlicedAddress(token.address)}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="border-border border rounded-md flex items-center px-1 py-[2px] gap-[2px] text-xs">
              <span className="text-neutral-text-dark">MCAP</span>
              <span>
                {getReadableNumber(token.market_data.market_cap.usd, 2, '$')}
              </span>
            </div>
            <div className="border-border border rounded-md flex items-center px-1 py-[2px] gap-[2px] text-xs">
              <span className="text-neutral-text-dark">VOL</span>
              <span>
                {getReadableNumber(token.market_data.volume['24h'], 2, '$')}
              </span>
            </div>
            <div className="border-border border rounded-md flex items-center px-1 py-[2px] gap-[2px] text-xs">
              <span className="text-neutral-text-dark">LIQ</span>
              <span>
                {getReadableNumber(token.market_data.liquidity, 2, '$')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchTokenItem;
