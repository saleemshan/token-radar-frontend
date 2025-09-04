'use client';
import {
  TOKEN_PLACEHOLDER_IMAGE,
  MARKET_INTELLIGENCE_PLACEHOLDER_IMAGE,
} from '@/utils/image';
import Image from 'next/image';
import React, { useState } from 'react';

const ImageFallback = ({
  src,
  alt,
  width,
  height,
  className,
  type = 'token',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  type?: 'market-intelligence' | 'token';
}) => {
  const [imageError, setImageError] = useState(false);
  let placeholder = '';
  switch (type) {
    case 'token':
      placeholder = TOKEN_PLACEHOLDER_IMAGE;
      break;

    case 'market-intelligence':
      placeholder = MARKET_INTELLIGENCE_PLACEHOLDER_IMAGE;
      break;

    default:
      placeholder = TOKEN_PLACEHOLDER_IMAGE;
      break;
  }
  return (
    <Image
      src={`${imageError || !src ? placeholder : src}`}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImageError(true)}
    />
  );
};

export default ImageFallback;
