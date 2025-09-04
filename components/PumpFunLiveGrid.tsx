'use client'
import React from 'react'
import PumpFunLiveCard from './PumpFunLiveCard'
import usePumpFunLiveData, { PumpFunLiveToken } from '@/hooks/data/usePumpFunLiveData'

const PumpFunLiveSkeleton = () => {
    return (
        <div className="group relative flex flex-col h-full border border-border rounded-lg bg-neutral-950 overflow-hidden animate-pulse">
            {/* Live Thumbnail Skeleton */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-neutral-800" />

            {/* Content Skeleton */}
            <div className="flex flex-col flex-1 p-3">
                {/* Main Content Area - grows to fill space */}
                <div className="flex flex-col gap-3 flex-1">
                    {/* Token Info Skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="bg-neutral-800 min-w-10 min-h-10 max-w-10 max-h-10 rounded-full" />
                        <div className="flex flex-col flex-1 min-w-0 gap-1">
                            <div className="flex items-center gap-2">
                                <div className="h-4 bg-neutral-800 rounded w-16" />
                                <div className="h-4 bg-neutral-800 rounded w-12" />
                            </div>
                            <div className="h-3 bg-neutral-800 rounded w-20" />
                        </div>
                    </div>

                    {/* Description Skeleton - fixed height container */}
                    <div className="min-h-[2.5rem] space-y-1">
                        <div className="h-3 bg-neutral-800 rounded w-full" />
                        <div className="h-3 bg-neutral-800 rounded w-3/4" />
                    </div>

                    {/* Stats Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <div className="h-3 bg-neutral-800 rounded w-16" />
                            <div className="h-3 bg-neutral-800 rounded w-12" />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-3 bg-neutral-800 rounded w-8" />
                            <div className="h-6 w-6 bg-neutral-800 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Footer Skeleton - always at bottom */}
                <div className="flex items-center justify-between border-t border-border pt-2 mt-3">
                    <div className="h-3 bg-neutral-800 rounded w-20" />

                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <div className="h-3 w-3 bg-neutral-800 rounded" />
                            <div className="h-3 w-3 bg-neutral-800 rounded" />
                            <div className="h-3 w-3 bg-neutral-800 rounded" />
                        </div>
                        <div className="h-3 bg-neutral-800 rounded w-12" />
                    </div>
                </div>
            </div>
        </div>
    )
}

interface PumpFunLiveGridProps {
    onTokenClick?: (token: PumpFunLiveToken) => void
    onBuyClick?: (token: PumpFunLiveToken) => void
}

const PumpFunLiveGrid = ({ onTokenClick, onBuyClick }: PumpFunLiveGridProps) => {
    const {
        data: pumpFunLiveData,
        isLoading,
        isError,
        error,
    } = usePumpFunLiveData({
        limit: 48,
        sort: 'currently_live',
        order: 'DESC',
    })

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-fr">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <PumpFunLiveSkeleton key={index} />
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-64 text-red-500">
                <div className="text-center">
                    <p className="text-sm">Failed to load PumpFun live streams</p>
                    <p className="text-xs text-neutral-text-dark mt-1">{error?.message || 'Something went wrong'}</p>
                </div>
            </div>
        )
    }

    if (!pumpFunLiveData || pumpFunLiveData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-neutral-text-dark">
                <div className="text-center">
                    <p className="text-sm">No live streams found</p>
                    <p className="text-xs mt-1">Check back later for live content</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 auto-rows-fr">
                {pumpFunLiveData.map(token => (
                    <PumpFunLiveCard key={token.mint} token={token} onClick={() => onTokenClick?.(token)} onBuyClick={() => onBuyClick?.(token)} />
                ))}
            </div>
        </div>
    )
}

export default PumpFunLiveGrid
