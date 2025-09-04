'use client'
import React, { useState } from 'react'
import { FaVideoSlash } from 'react-icons/fa6'

export default function TwitterVideoPlayer({
    url = '',
    aspectRatio = [1, 1],
    thumbnail,
}: {
    url: string
    aspectRatio?: [number, number]
    thumbnail?: string
}) {
    const [error, setError] = useState(false)

    return (
        <div className="w-full" style={{ aspectRatio: aspectRatio.join('/') }}>
            {error || !url ? (
                <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-neutral-text-dark ">
                    <FaVideoSlash className="text-[36px]" />
                    <div className=" text-xs text-center">Video Unavailable</div>
                </div>
            ) : (
                <video
                    controls
                    onError={() => setError(true)}
                    className="w-full h-full object-cover rounded"
                    preload="metadata"
                    playsInline
                    controlsList="nodownload"
                    poster={thumbnail}
                >
                    <source src={url} type="video/mp4" />
                </video>
            )}
        </div>
    )
}
