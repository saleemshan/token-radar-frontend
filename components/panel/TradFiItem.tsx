import React, { useEffect, useState } from 'react'
import { SocialEntity, TradfiItem } from '@/types/newstrading'
import { useSettingsContext } from '@/context/SettingsContext'
import ImageFallback from '../ImageFallback'
import Link from 'next/link'
import { HiExternalLink } from 'react-icons/hi'
import Image from 'next/image'
import LinkPreview from '../LinkPreview'
import TwitterVideoPlayer from '../TwitterVideoPlayer'

interface Props {
    data: TradfiItem
    showAvatar?: boolean
    headlineLink?: boolean
    showExternalUrlIcon?: boolean
}

const renderMediaEntities = (entities: SocialEntity[]) => {
    return entities.map((entity, index) => {
        if (entity.type === 'video') {
            return (
                <div key={index} className="border rounded border-border overflow-hidden">
                    <TwitterVideoPlayer url={entity.url} aspectRatio={entity.info?.aspect_ratio} thumbnail={entity.info?.thumbnail} />
                </div>
            )
        }

        if (entity.type === 'photo') {
            return (
                <div key={index} className="border rounded border-border overflow-hidden">
                    <Image
                        src={entity.url}
                        alt="media"
                        width={900}
                        height={500}
                        className=" select-none  w-full h-full object-contain object-center drag-none"
                    />
                </div>
            )
        }

        if (entity.type === 'url') {
            return (
                <div key={index} className="border rounded border-border overflow-hidden">
                    <LinkPreview url={entity.url} />
                </div>
            )
        }

        if (entity.type === 'video') {
            return (
                <div key={index} className="border rounded border-border overflow-hidden">
                    <Image
                        src={entity.url}
                        alt="media"
                        width={900}
                        height={500}
                        className=" select-none  w-full h-full object-contain object-center"
                    />
                </div>
            )
        }
    })
}

const TradFiItem = ({ data, showAvatar = false, headlineLink = false, showExternalUrlIcon = true }: Props) => {
    const { timezone } = useSettingsContext()

    const [relativeDate, setRelativeDate] = useState('')

    useEffect(() => {
        const date = new Date(data.created_at)
        const options: Intl.DateTimeFormatOptions = {
            timeZone: timezone,
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }
        const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date)
        setRelativeDate(formattedDate)
    }, [timezone, data.created_at])

    return (
        <div className={`min-h-fit apply-transition flex flex-col  bg-table-odd even:bg-table-even news-item group`}>
            <div className=" flex flex-col  relative ">
                {showAvatar && data.user && (
                    <div className="flex items-center gap-2 p-2 pb-0">
                        <ImageFallback
                            src={`${data.user.profile_image_url}`}
                            alt={data.user.name}
                            width={24}
                            height={24}
                            className="  object-cover object-center rounded-full w-6 min-w-6 min-h-6 h-6"
                        />
                        <Link href={`https://x.com/${data.user.screen_name}`} target="_blank" className="flex flex-wrap gap-1 items-center">
                            <div className="text-xs text-neutral-text text-left break-words  ">{data.user.name}</div>
                            <div className="text-2xs text-neutral-text-dark text-left break-all">@{data.user.screen_name}</div>
                        </Link>
                    </div>
                )}

                {showExternalUrlIcon && data.user && (
                    <Link
                        href={`https://x.com/${data.user.screen_name}/status/${data.id}`}
                        target="_blank"
                        className="hidden group-hover:flex absolute z-50 right-2 top-2 rounded p-1 w-5 h-5  items-center bg-table-odd hover:bg-neutral-900 justify-center text-neutral-text border border-border  apply-transition"
                    >
                        <HiExternalLink className="text-2xs" />
                    </Link>
                )}

                {headlineLink && data.user && data.user.screen_name && data.id ? (
                    <>
                        <Link
                            href={`https://x.com/${data.user.screen_name}/status/${data.id}`}
                            className="flex flex-col gap-2 w-full relative p-2 pb-5 focus:outline-none "
                            target="_blank"
                        >
                            <div className="text-xs text-neutral-text/80 text-left break-words  w-full text-highlight">
                                {data.text ?? data.headline}
                            </div>
                            {data.entities && renderMediaEntities(data.entities)}
                        </Link>
                    </>
                ) : (
                    <div className="flex flex-col gap-2 w-full relative p-2 pb-5">
                        <div className="text-xs text-neutral-text/80 text-left break-words  w-full text-highlight">{data.text ?? data.headline}</div>
                        {data.entities && renderMediaEntities(data.entities)}
                    </div>
                )}

                <div className="text-2xs text-neutral-text-dark text-nowrap absolute bottom-0 right-2 pointer-events-none">{relativeDate}</div>
            </div>
        </div>
    )
}

export default TradFiItem
