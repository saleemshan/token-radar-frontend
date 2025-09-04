'use client'
import React from 'react'
import Image from 'next/image'
import { getReadableNumber } from '@/utils/price'
import { getTimeComparison } from '@/utils/time'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { PumpFunLiveToken } from '@/hooks/data/usePumpFunLiveData'
import { FiUsers, FiMessageCircle } from 'react-icons/fi'
import { MdLiveTv } from 'react-icons/md'
import { FaTelegramPlane } from 'react-icons/fa'
import { FaXTwitter, FaGlobe } from 'react-icons/fa6'
import { GiElectric } from 'react-icons/gi'

interface PumpFunLiveCardProps {
    token: PumpFunLiveToken
    onClick?: () => void
    onBuyClick?: (token: PumpFunLiveToken) => void
}

const PumpFunLiveCard = ({ token, onClick, onBuyClick }: PumpFunLiveCardProps) => {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col h-full border border-border rounded-lg bg-neutral-950 hover:bg-neutral-900/50 apply-transition cursor-pointer overflow-hidden"
        >
            {/* Live Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                {token.thumbnail ? (
                    <Image src={token.thumbnail} alt={`${token.name} live stream`} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <MdLiveTv className="w-8 h-8 text-neutral-text-dark" />
                    </div>
                )}

                {/* Live indicator */}
                {token.is_currently_live && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                )}

                {/* Participant count */}
                {token.num_participants && token.num_participants > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        <FiUsers className="w-3 h-3" />
                        {token.num_participants}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-3">
                {/* Main Content Area - grows to fill space */}
                <div className="flex flex-col gap-3 flex-1">
                    {/* Token Info */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="bg-black min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                                <Image
                                    src={token.image_uri || TOKEN_PLACEHOLDER_IMAGE}
                                    alt={`${token.name} logo`}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-white truncate">{token.symbol || 'Unknown'}</span>
                            </div>
                            <span className="text-xs text-neutral-text-dark truncate">{token.name || 'Unknown Token'}</span>
                        </div>
                    </div>

                    {/* Description - fixed height container */}
                    <div className="min-h-[2.5rem]">
                        {token.description && <p className="text-xs text-neutral-text/80 line-clamp-2 break-words">{token.description}</p>}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                            <span className="text-neutral-text-dark">Market Cap</span>
                            <span className="text-neutral-text font-medium">
                                {token.usd_market_cap ? `${getReadableNumber(token.usd_market_cap, 2, '$')}` : 'N/A'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {token.reply_count && token.reply_count > 0 && (
                                <div className="flex items-center gap-1 text-neutral-text-dark">
                                    <FiMessageCircle className="w-3 h-3" />
                                    {getReadableNumber(token.reply_count, 0)}
                                </div>
                            )}

                            {/* Buy Button */}
                            <button
                                type="button"
                                onClick={e => {
                                    e.stopPropagation()
                                    onBuyClick?.(token)
                                }}
                                className="p-1.5 min-w-6 min-h-6 text-center pointer-events-auto flex hover:bg-yellow-500/20 apply-transition text-yellow-500 bg-yellow-500/10 rounded-lg border border-border items-center justify-center"
                                title="Quick Buy"
                            >
                                <GiElectric className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer - always at bottom */}
                <div className="flex items-center justify-between text-xs text-neutral-text-dark border-t border-border pt-2 mt-3">
                    <span>Created {token.created_timestamp ? getTimeComparison(new Date(token.created_timestamp).toISOString()) : 'Unknown'}</span>

                    <div className="flex items-center gap-2">
                        {/* Social Links */}
                        <div className="flex items-center gap-1">
                            {token.twitter && (
                                <a
                                    href={token.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-neutral-text-dark hover:text-neutral-text apply-transition"
                                    title="Twitter"
                                >
                                    <FaXTwitter className="w-3 h-3" />
                                </a>
                            )}
                            {token.website && (
                                <a
                                    href={token.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-neutral-text-dark hover:text-neutral-text apply-transition"
                                    title="Website"
                                >
                                    <FaGlobe className="w-3 h-3" />
                                </a>
                            )}
                            {token.telegram && (
                                <a
                                    href={token.telegram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="text-neutral-text-dark hover:text-neutral-text apply-transition"
                                    title="Telegram"
                                >
                                    <FaTelegramPlane className="w-3 h-3" />
                                </a>
                            )}
                        </div>

                        {token.creator && (
                            <span className="truncate max-w-16" title={token.creator}>
                                {token.creator.slice(0, 4)}...{token.creator.slice(-4)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PumpFunLiveCard
