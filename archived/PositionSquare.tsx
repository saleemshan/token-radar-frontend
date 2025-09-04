import { getSlicedAddress } from '@/utils/crypto';
import {
  DEVELOPER_ICON,
  INSIDER_ICON,
  SMART_MONEY_ICON,
  SNIPER_ICON,
} from '@/utils/label';
import Image from 'next/image';
import React from 'react';

const PositionSquare = ({
  position,
  address,
  onClick,
  type,
  width = 20,
  height = 20,
}: {
  position: string;
  address: string;
  onClick?: () => void;
  type: string;
  width?: number;
  height?: number;
}) => {
  const handleGetIcon = () => {
    if (type.toLowerCase() === 'sniper') {
      return (
        <Image
          priority
          src={SNIPER_ICON}
          alt="Sniper"
          width={width}
          height={height}
        />
      );
    }
    if (type.toLowerCase() === 'dev' || type.toLowerCase() === 'developer') {
      return (
        <Image
          src={DEVELOPER_ICON}
          alt="Developer"
          width={width}
          height={height}
        />
      );
    }
    if (type.toLowerCase() === 'insiders') {
      return (
        <Image src={INSIDER_ICON} alt="Insider" width={width} height={height} />
      );
    }
    if (type.toLowerCase() === 'smartmoney') {
      return (
        <Image
          src={SMART_MONEY_ICON}
          alt="Smart money"
          width={width}
          height={height}
        />
      );
    }
  };

  return (
    <div
      className="relative group cursor-pointer"
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div className=" pointer-events-none absolute z-[80] border-border text-xs -top-4 translate-x-1/2 right-1/2 px-1 group-hover:block hidden border bg-black rounded-sm xl:rounded">
        {getSlicedAddress(address, 2, '..')}
      </div>
      {position === 'no holdings' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center bg-neutral-400/20 border border-neutral-500 text-neutral-400 relative">
          {handleGetIcon()}
        </div>
      )}
      {position === 'bought_more' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center bg-positive/20 border border-positive text-positive/80 relative">
          {handleGetIcon()}
        </div>
      )}
      {position === 'hold' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center bg-blue-500/20 border border-blue-500 text-blue-500/80 relative">
          {handleGetIcon()}
        </div>
      )}
      {position === 'sold_part' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center border border-negative text-negative/80 relative overflow-hidden">
          <div className=" pointer-events-none w-1/2 bg-negative/20 border-r border-negative h-full absolute inset-y-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {handleGetIcon()}
          </div>
        </div>
      )}
      {position === 'sold' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center bg-negative/20 border border-negative text-negative/80 relative">
          {handleGetIcon()}
        </div>
      )}
      {position === 'transfered' && (
        <div className=" pointer-events-none   aspect-square rounded-[6px] flex items-center justify-center bg-yellow-400/20 border border-yellow-400 text-yellow-400/80 relative">
          {handleGetIcon()}
        </div>
      )}
    </div>
  );
};

export default PositionSquare;
