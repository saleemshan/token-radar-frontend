'use client'
import { useUser } from '@/context/UserContext'
import useAlphaFeedData from '@/hooks/data/useAlphaFeedData'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { FaCircleInfo } from 'react-icons/fa6'
import TextLoading from '../TextLoading'
import useIsMobile from '@/hooks/useIsMobile'
import { getAlphaFeedTokenImage, getChainImage } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import Tooltip from '../Tooltip'
import { FaCog } from 'react-icons/fa'
import AlphaFeedModal from '../modal/AlphaFeedModal'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { getReadableDetailDate } from '@/utils/time'
import { useSettingsContext } from '@/context/SettingsContext'
import { useAlphaFeedPreferencesData } from '@/hooks/data/useAlphaFeedPreferencesData'
import EmptyData from '../global/EmptyData'
import ImageFallback from '../ImageFallback'
import { HiExternalLink } from 'react-icons/hi'

const AlphaFeedPanel = ({ showBorder = true }: { showBorder?: boolean }) => {
    const { ready, authenticated } = usePrivy()
    const { timezone } = useSettingsContext()
    const { login: handleSignIn } = useLogin()
    const { toggleAlphaFeed } = useUser()
    const isMobile = useIsMobile()
    const { chain, setLastSelectedToken } = useUser()
    const { data, isLoading } = useAlphaFeedData(chain.api)
    const { data: userAlphaFeedPreferencesData } = useAlphaFeedPreferencesData()
    const [gotPreferences, setGotPreferences] = useState<undefined | boolean>(undefined)
    const [filteredData, setFilteredData] = useState<AlphaFeed>([])

    const alphaFeedModalRef = useRef<{
        toggleModal: () => void
    }>(null)

    useEffect(() => {
        // console.log({ userAlphaFeedPreferencesData })

        if (
            userAlphaFeedPreferencesData &&
            (userAlphaFeedPreferencesData.twitterAccounts?.length > 0 || userAlphaFeedPreferencesData.twitterLists?.length > 0)
        ) {
            setGotPreferences(true)
        } else {
            setGotPreferences(false)
        }
    }, [userAlphaFeedPreferencesData])

    useEffect(() => {
        if (data) {
            // console.log({ data })

            setFilteredData([...data])
        }
    }, [data, timezone])

    return (
        <div
            className={`h-full flex flex-col w-full overflow-hidden relative  pointer-events-auto bg-black ${
                showBorder ? 'md:border md:border-border md:rounded-lg' : ''
            }`}
        >
            <div
                className={`p-3 flex  border-border items-center  border-b   justify-between md:items-center min-h-[3.5rem] max-h-[3.5rem] md:min-h-14 md:max-h-14`}
            >
                <div className="flex w-full items-center justify-between md:order-1 order-2  ">
                    <div className={`text-sm font-semibold leading-6 text-white flex-1  flex items-center gap-2 `}>
                        <div>Alpha Feed</div>
                        <Tooltip text="We monitor many of the high quality public and private alpha groups, flagging any tokens being discussed across these groups in real-time.">
                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    {ready && authenticated && (
                        <button
                            type="button"
                            onClick={() => {
                                if (alphaFeedModalRef.current) {
                                    alphaFeedModalRef.current.toggleModal()
                                }
                            }}
                            className={`flex  bg-table-odd border border-border rounded-lg  px-1 gap-2 w-8 min-w-8 h-8  min-h-8 md:w-6 md:min-w-6 md:h-6  md:min-h-6 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text `}
                        >
                            <FaCog className="md:text-xs" />
                        </button>
                    )}
                </div>
            </div>

            {ready && authenticated ? (
                <>
                    {gotPreferences ? (
                        <>
                            <div className="flex flex-col overflow-y-auto relative h-full gap-2 p-2">
                                {isLoading ? (
                                    <>
                                        {Array.from({ length: 10 }).map((_, index) => {
                                            return (
                                                <div key={index} className=" w-full  flex">
                                                    <div className="flex-1 flex flex-col gap-2 p-3">
                                                        <div className="flex gap-2 items-center">
                                                            <div className=" animate-pulse bg-border min-w-8 min-h-8 max-w-8 max-h-8 rounded-full border border-border overflow-hidden relative flex items-center justify-center"></div>
                                                            <TextLoading />
                                                        </div>
                                                        <TextLoading />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </>
                                ) : (
                                    <>
                                        {filteredData && filteredData.length > 0 ? (
                                            filteredData.map((feed, index) => {
                                                return (
                                                    <div
                                                        key={`${feed.id}-${index}`}
                                                        data-timestamp={feed.alphaFeedAt}
                                                        className="w-full  flex alpha-feed-item flex-col group relative border  border-border rounded-lg min-h-fit"
                                                    >
                                                        {feed.type === 'tweet' && (
                                                            <div className="flex items-center gap-2 p-2">
                                                                {feed.user && (
                                                                    <div className="flex items-center gap-2  pb-0">
                                                                        <ImageFallback
                                                                            src={`${feed.user.profile_image_url}`}
                                                                            alt={feed.user.name}
                                                                            width={24}
                                                                            height={24}
                                                                            className="  object-cover object-center rounded-full w-6 min-w-6 min-h-6 h-6"
                                                                        />
                                                                        <Link
                                                                            href={`https://x.com/${feed.user.screen_name}`}
                                                                            target="_blank"
                                                                            className="flex flex-wrap gap-1 items-center"
                                                                        >
                                                                            <div className="text-xs text-neutral-text text-left break-words  ">
                                                                                {feed.user.name}
                                                                            </div>
                                                                            <div className="text-2xs text-neutral-text-dark text-left break-all">
                                                                                @{feed.user.screen_name}
                                                                            </div>
                                                                        </Link>
                                                                    </div>
                                                                )}

                                                                <Link
                                                                    href={`${feed.twitterLink ?? 'https://x.com/'}`}
                                                                    target="_blank"
                                                                    className="hidden group-hover:flex ml-auto rounded p-1 w-5 h-5  items-center bg-table-odd hover:bg-neutral-900 justify-center  text-neutral-text border border-border  apply-transition"
                                                                >
                                                                    <HiExternalLink className="text-2xs" />
                                                                </Link>
                                                            </div>
                                                        )}

                                                        <div className="relative flex flex-col w-full">
                                                            <p className="break-words whitespace-break-spaces text-xs p-2 pt-0 pb-5">
                                                                {feed.content}
                                                            </p>

                                                            <div className="absolute right-2 bottom-0 text-[10px] text-neutral-text-dark flex items-center ">
                                                                <div className="">{getReadableDetailDate(feed.alphaFeedAt, timezone)}</div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center border-t rounded border-border ">
                                                            <div className="text-2xs text-neutral-text border-r border-border h-full flex items-center justify-center px-2">
                                                                Tokens
                                                            </div>
                                                            <div className="flex flex-wrap p-1">
                                                                <Link
                                                                    href={getTokenUrl(feed.chain, feed.address, isMobile)}
                                                                    onClick={() => {
                                                                        setLastSelectedToken({
                                                                            address: feed.address,
                                                                            chain: feed.chain,
                                                                        })
                                                                        isMobile && toggleAlphaFeed()
                                                                    }}
                                                                    className="flex flex-col gap-2 overflow-hidden relative hover:bg-neutral-900 text-neutral-text-dark hover:text-neutral-text border-neutral-800 border transition-all duration-200 rounded-full px-[2px] py-[1px]"
                                                                >
                                                                    <div className="flex gap-2 items-center relative">
                                                                        <div className="relative">
                                                                            <div className="bg-black min-w-5 min-h-5 max-w-5 max-h-5 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                                                                                <Image
                                                                                    src={getAlphaFeedTokenImage(feed)}
                                                                                    alt={`${feed.name ?? feed.symbol} logo`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className=" w-full h-full object-cover object-center"
                                                                                />
                                                                            </div>
                                                                            <div className="absolute w-[12px] h-[12px] min-w-[12px] min-h-[12px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[4px]  p-[1px] flex items-center justify-center bg-black">
                                                                                <Image
                                                                                    src={getChainImage(feed.chain)}
                                                                                    alt={`${feed.name ?? feed.symbol} logo`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className="rounded-full w-full h-full object-cover object-center"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className=" break-all text-xs pr-1">{feed.name ?? feed.symbol}</div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <EmptyData />
                                        )}
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full max-h-full flex items-center justify-center bg-black/80 flex-col">
                            <button
                                type="button"
                                onClick={() => {
                                    if (alphaFeedModalRef.current) {
                                        alphaFeedModalRef.current.toggleModal()
                                    }
                                }}
                                className={`flex  bg-table-odd border border-border rounded-lg  text-xs p-1 gap-2 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text-dark`}
                            >
                                Set up the alpha feed source
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center p-3 gap-1">
                    <button type="button" onClick={handleSignIn} className=" border-b border-white">
                        Sign in
                    </button>
                    <span> to view your feed.</span>
                </div>
            )}

            <AlphaFeedModal ref={alphaFeedModalRef} />
        </div>
    )
}

export default AlphaFeedPanel
