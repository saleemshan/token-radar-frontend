import React from 'react'

const TradFiItemSkeleton = () => {
    return (
        <div className="flex flex-col p-2 gap-1 w-full border-b border-border relative animate-pulse">
            <div className="h-3 bg-neutral-800 rounded w-4/5"></div>
            <div className="h-3 bg-neutral-800 rounded w-2/4"></div>
        </div>
    )
}

export default TradFiItemSkeleton
