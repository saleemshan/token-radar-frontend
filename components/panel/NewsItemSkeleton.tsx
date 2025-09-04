import React from 'react'

const NewsItemSkeleton = () => {
    return (
        <div className=" group relative flex flex-col border border-border rounded-lg bg-neutral-950 animate-pulse">
            {/* <div className="absolute top-2 right-2 w-5 h-5 rounded bg-neutral-800" /> */}

            <div className="flex flex-col p-2 gap-2 w-full border-b border-border relative flex-1">
                <div className="h-3 bg-neutral-800 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-800 rounded w-2/4"></div>
            </div>

            <div className="flex flex-col w-full text-inherit">
                <div className="flex items-center border-b border-border text-xs">
                    <div className=" w-12 text-2xs bg-neutral-800 rounded h-3 mx-1" />
                    <div className="flex gap-2 pl-2 pr-2 py-1 w-full border-l border-border overflow-x-auto no-scrollbar">
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <div key={idx} className="w-12 h-3 bg-neutral-800 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full text-inherit">
                <div className="flex items-center border-b border-border text-xs p-2 gap-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="w-full h-8 bg-neutral-800 rounded-md" />
                    ))}
                </div>
            </div>

            <div className="flex flex-col w-full text-inherit">
                <div className="flex items-center border-b border-border text-xs">
                    <div className=" w-12 text-2xs bg-neutral-800 rounded h-3 mx-1" />
                    <div className="flex gap-2 pl-2 pr-2 py-1 w-full border-l border-border overflow-x-auto no-scrollbar">
                        <div className="w-24 h-3 bg-neutral-800 rounded-full" />
                    </div>
                </div>
            </div>

            <div className="border-t border-border flex flex-col p-1 gap-1">
                {/* <div className="flex items-center justify-between">
                    <div className="w-24 h-3 bg-neutral-800 rounded" />
                    <div className="w-24 h-3 bg-neutral-800 rounded" />
                </div> */}
                <div className="flex items-center justify-between">
                    <div className="w-24 h-3 bg-neutral-800 rounded" />
                    <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <div key={idx} className="w-3 h-3 rounded-full bg-neutral-800" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewsItemSkeleton
