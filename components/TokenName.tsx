'use client'
import { getSlicedAddress } from '@/utils/crypto'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { FaTelegramPlane } from 'react-icons/fa'
import { FaXTwitter, FaGlobe } from 'react-icons/fa6'
import CopyToClipboard from './CopyToClipboard'
import { getChainImage, getTokenImage, TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import Tooltip from './Tooltip'

const TokenName = ({
    token,
    showSocials = true,
    showTokenAddress = true,
    size = 'small',
    showCopyButton = true,
    showLink = false,
    isMobile = false,
    onClick,
    className,
}: {
    token: Token | undefined
    showSocials?: boolean
    showTokenAddress?: boolean
    size?: 'small' | 'normal' | 'extra-small'
    showCopyButton?: boolean
    showLink?: boolean
    isMobile?: boolean
    className?: string
    onClick?: () => void
}) => {
    const [imageError, setImageError] = useState(false)

    return (
        <>
            {token ? (
                <div className={`flex items-center gap-2 w-full ${className}`}>
                    <div className="relative">
                        <div
                            className={`bg-black  rounded-full border border-border overflow-hidden relative flex items-center justify-center 
          ${size === 'extra-small' ? 'min-w-8 min-h-8 max-w-8 max-h-8' : ''} 
          ${size === 'small' ? 'min-w-9 min-h-9 max-w-9 max-h-9' : ''} 
          ${size === 'normal' ? 'min-w-12 min-h-12 max-w-12 max-h-12' : ''}`}
                        >
                            <Image
                                src={imageError ? TOKEN_PLACEHOLDER_IMAGE : getTokenImage(token)}
                                alt={`${token.name} logo`}
                                width={100}
                                height={100}
                                onError={() => setImageError(true)}
                                className=" w-full h-full object-cover object-center"
                            />
                        </div>
                        <div className="absolute w-[16px] h-[16px] min-w-[16px] min-h-[16px] flex items-center justify-center  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                            <Image
                                src={getChainImage(token.chain_id)}
                                alt={`${token.name} logo`}
                                width={32}
                                height={32}
                                className=" w-full h-full object-cover object-center"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <div className="flex items-center w-full gap-[2px]">
                            {showLink ? (
                                <Link
                                    href={getTokenUrl(token.chain_id, token.address, isMobile)}
                                    style={{ maxWidth: isMobile ? '4rem' : 'auto', width: isMobile ? '4rem' : 'auto' }}
                                    className={`leading-4  font-semibold text-white text-ellipsis text-nowrap overflow-hidden 
                ${size === 'extra-small' ? 'text-xs' : ''}
              ${size === 'small' ? 'text-sm' : ''} 
              ${size === 'normal' ? 'text-base' : ''}`}
                                >
                                    <Tooltip text={token.name}>{token.symbol}</Tooltip>
                                </Link>
                            ) : (
                                <div
                                    style={{ maxWidth: isMobile ? '4rem' : 'auto', width: isMobile ? '4rem' : 'auto' }}
                                    onClick={() => {
                                        if (onClick) onClick()
                                    }}
                                    className={`leading-4  font-semibold text-white text-ellipsis text-nowrap overflow-hidden
                ${size === 'extra-small' ? 'text-xs' : ''}
              ${size === 'small' ? 'text-sm' : ''} 
              ${size === 'normal' ? 'text-base' : ''}`}
                                >
                                    <Tooltip text={token.name}>{token.symbol}</Tooltip>
                                </div>
                            )}

                            {token.generator === 'pump.fun' && (
                                <div className="flex items-center gap-1 px-1 bg-border/20 border border-border rounded-xl text-2xs text-neutral-text-dark font-medium">
                                    <Image
                                        className="w-3 h-3"
                                        src={`${process.env.basePath}/images/brand/pumpfun.png`}
                                        width={100}
                                        height={100}
                                        alt="Pumpfun Logo"
                                    />
                                    <span>pump.fun</span>
                                </div>
                            )}

                            {showSocials === true && (
                                <>
                                    {token && token.links && token.links.x && (
                                        <Link
                                            href={token.links.x}
                                            className=" pointer-events-auto"
                                            target="_blank"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <FaXTwitter className="text-xs" />
                                        </Link>
                                    )}
                                    {token.links && token.links.website && (
                                        <Link
                                            href={token.links.website}
                                            className=" pointer-events-auto"
                                            target="_blank"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <FaGlobe className="text-xs" />
                                        </Link>
                                    )}
                                    {token.links && token.links.telegram && (
                                        <Link
                                            href={token.links.telegram}
                                            className=" pointer-events-auto"
                                            target="_blank"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <FaTelegramPlane className="text-xs" />
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex items-center  text-neutral-text-dark text-2xs leading-3 pointer-events-none ">
                            <div className="">{getSlicedAddress(token.address, undefined, '-')}</div>
                            {showTokenAddress && showCopyButton && <CopyToClipboard content={token.address} />}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <div
                        className={`bg-border animate-pulse  rounded-full border border-border overflow-hidden relative flex items-center justify-center 
          ${size === 'extra-small' ? 'min-w-8 min-h-8 max-w-8 max-h-8' : ''} 
          ${size === 'small' ? 'min-w-9 min-h-9 max-w-9 max-h-9' : ''} 
          ${size === 'normal' ? 'min-w-12 min-h-12 max-w-12 max-h-12' : ''}`}
                    ></div>
                    <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <div className="flex items-center w-full gap-[2px]">
                            <div className=" w-32  xl:w-44 h-[10px] rounded-full animate-pulse bg-border"></div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className=" w-24 xl:w-32 h-2 rounded-full animate-pulse bg-border"></div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TokenName
