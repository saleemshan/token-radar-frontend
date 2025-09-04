'use client'
import useTokenTwitterRecycleData from '@/hooks/data/useTwitterRecycleData'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import CustomTooltip from './CustomTooltip'
import TextLoading from './TextLoading'

const QueryTokenData = ({ tokenData }: { tokenData: Token | undefined }) => {
    const [tokenTwitterId, setTokenTwitterId] = useState<string | undefined>(undefined)

    const { data: twitterRecycleData, isLoading: twitterRecycleDataIsLoading } = useTokenTwitterRecycleData(tokenTwitterId)

    const getTwitterUrl = (key: string) => {
        //key example: - arcdotfun (3months ago)
        const twitterId = key.split(' ')[1]
        if (twitterId) {
            // console.log(`https://x.com/${twitterId}`);

            return `https://x.com/${twitterId}`
        } else {
            return `https://x.com`
        }
    }

    useEffect(() => {
        if (tokenData) {
            const twitterUrl = tokenData?.links?.x
            if (twitterUrl) {
                const splitTwitterUrl = twitterUrl.split('/')
                const twitterId = splitTwitterUrl[splitTwitterUrl.length - 1]
                if (twitterId) {
                    setTokenTwitterId(twitterId)
                }
            }
        }
    }, [tokenData])

    const getRecycleColor = (length: number) => {
        if (length <= 0) {
            return 'text-positive'
        } else if (length <= 3) {
            return ' text-yellow-600'
        } else if (length > 3) {
            return ' text-red-600'
        } else {
            return 'text-neutral-text-dark'
        }
    }

    if (tokenData)
        return (
            <div className="w-full flex border border-border rounded-lg divide-x divide-border text-neutral-text-dark overflow-hidden">
                {tokenTwitterId ? (
                    <div className="flex items-center justify-center size-8 relative hover:cursor-pointer">
                        <CustomTooltip
                            icon={
                                <FaXTwitter
                                    className={`text-xs ${
                                        twitterRecycleData ? getRecycleColor(twitterRecycleData.length) : 'text-neutral-text-dark'
                                    } `}
                                />
                            }
                        >
                            <div className=" flex flex-col gap-1  ">
                                <div>Twitter Recycle:</div>
                                {twitterRecycleDataIsLoading ? (
                                    <TextLoading className="w-full" />
                                ) : (
                                    <>
                                        {twitterRecycleData && twitterRecycleData.length > 0 ? (
                                            twitterRecycleData.map((data, index) => {
                                                // return <div key={index}>{data}</div>;
                                                return (
                                                    <Link href={getTwitterUrl(data)} className="hover:underline" target="_blank" key={index}>
                                                        {data}
                                                    </Link>
                                                )
                                            })
                                        ) : (
                                            <span>No recycle found.</span>
                                        )}

                                        {!twitterRecycleData && <span>No data is available.</span>}
                                    </>
                                )}
                            </div>
                        </CustomTooltip>
                    </div>
                ) : (
                    <div className="flex items-center justify-center size-8 relative hover:cursor-pointer">
                        <CustomTooltip icon={<FaXTwitter className={`text-xs text-neutral-text-dark `} />}>
                            <div className=" flex flex-col gap-1  ">
                                <span>No data found.</span>
                            </div>
                        </CustomTooltip>
                    </div>
                )}

                {tokenData.address && (
                    <Link
                        href={`https://x.com/search?q=${tokenData?.address}`}
                        target="_blank"
                        className="flex-1 text-center flex items-center gap-1 h-8 min-h-8 justify-center  text-xs hover:bg-neutral-900 hover:text-neutral-text apply-transition"
                    >
                        <div>Search CA</div>
                        <FaSearch className="text-2xs" />
                    </Link>
                )}

                {tokenData.symbol && (
                    <Link
                        href={`https://x.com/search?q=$${tokenData?.symbol}`}
                        target="_blank"
                        className="flex-1 text-center flex items-center gap-1 h-8 min-h-8 justify-center  text-xs hover:bg-neutral-900 hover:text-neutral-text apply-transition"
                    >
                        <div>Search Ticker</div>
                        <FaSearch className="text-2xs" />
                    </Link>
                )}
            </div>
        )
}

export default QueryTokenData
