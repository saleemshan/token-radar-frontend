'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Spinner from './Spinner'

export default function LinkPreview({ url }: { url: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<{
        title?: string
        description?: string
        image?: string
    }>({})

    useEffect(() => {
        fetch(`/api/metadata?url=${encodeURIComponent(url)}`)
            .then(res => res.json())
            .then(setData)
    }, [url])

    if (!data) {
        return <Spinner />
    }

    if (!data.image) {
        return (
            // <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white rounded">
            //     {data.title ?? 'External Link'}
            // </a>
            <></>
        )
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className=" relative overflow-hidden flex flex-col group ">
            <Image src={data.image} alt={data.title || 'Link preview'} width={600} height={400} className=" drag-none h-full" />
            <div className="flex flex-col gap-1 absolute bottom-0 inset-x-0 bg-black/80 p-2 ">
                <h2 className="font-semibold text-xs">{data.title}</h2>
            </div>
        </a>
    )
}
