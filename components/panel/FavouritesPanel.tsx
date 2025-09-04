import { useUser } from '@/context/UserContext'
import useUserFavouriteTokensData from '@/hooks/data/useUserFavouriteTokensData'
import useIsMobile from '@/hooks/useIsMobile'
import { getChainImage, TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import { getTokenUrl } from '@/utils/url'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'
import FavouriteTokenButton from '../FavouriteTokenButton'
import { FaStar } from 'react-icons/fa6'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import EmptyData from '../global/EmptyData'

const FavouritesPanel = ({ showBorder = true }: { showBorder?: boolean }) => {
    const isMobile = useIsMobile()
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { chain, toggleFavouritesPanel, setLastSelectedToken, setFavouriteTokens } = useUser()
    const { data, isLoading } = useUserFavouriteTokensData(chain.api)

    useEffect(() => {
        if (ready && authenticated) {
            if (data === undefined || data.length === 0) {
                setFavouriteTokens([])
            } else {
                setFavouriteTokens(data)
            }
        }
    }, [ready, authenticated, data, setFavouriteTokens])

    return (
        <div
            className={`h-full flex flex-col w-full overflow-hidden   pointer-events-auto bg-black
        ${showBorder ? 'md:border md:border-border md:rounded-lg ' : ''}
        `}
        >
            <div
                className={`p-3 flex gap-3 border-border items-center  border-b justify-between md:items-center min-h-[3.5rem] max-h-[3.5rem] md:min-h-14 md:max-h-14`}
            >
                <div className={`text-sm font-semibold leading-6 text-white flex-1 md:order-1 order-2 flex items-center gap-2`}>
                    <div>Watchlist</div>
                </div>

                {/* <button
                    type="button"
                    onClick={toggleFavouritesPanel}
                    className={`flex lg:hidden order-1 lg:order-2 hover:bg-neutral-900 border border-border bg-table-odd rounded-lg w-8 h-8 items-center justify-center text-neutral-text-dark hover:text-neutral-text apply-transition `}
                >
                    <FaChevronLeft className="block md:hidden" />
                    <FaChevronRight className="hidden md:block" />
                </button> */}
            </div>
            <div className="flex flex-col w-full flex-1 overflow-hidden">
                <div className=" flex flex-col overflow-y-auto max-h-full flex-1 relative">
                    {ready && authenticated ? (
                        <>
                            {isLoading ? (
                                <>
                                    {Array.from({ length: 10 }).map((_, index) => {
                                        return (
                                            <div key={index} className="flex p-3 justify-between gap-3 items-center w-full border-b border-border/80">
                                                <div className="flex items-center justify-center  min-w-5 max-w-5">
                                                    <FaStar className="text-border animate-pulse text-lg" />
                                                </div>
                                                <div className="min-w-8 min-h-8 max-w-8 max-h-8  rounded-full border border-border bg-border animate-pulse"></div>
                                                <div className="h-2 rounded-full w-full bg-border animate-pulse"></div>
                                            </div>
                                        )
                                    })}
                                </>
                            ) : (
                                <>
                                    {data && data.length > 0 ? (
                                        data.map((data, index) => {
                                            if (data.name) {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex gap-3 px-3 py-2 items-center select-none bg-table-even  border-b border-border/80 apply-transition cursor-pointer hover:bg-table-odd"
                                                    >
                                                        <FavouriteTokenButton
                                                            stopPropagation={true}
                                                            tokenData={
                                                                {
                                                                    address: data.address,
                                                                    image: { icon: data.logo ?? '' },
                                                                    name: data.name,
                                                                    symbol: data.symbol ?? '',
                                                                    chain_id: data.chain,
                                                                } as Token
                                                            }
                                                        />
                                                        <Link
                                                            onClick={() => {
                                                                if (isMobile) toggleFavouritesPanel()
                                                                setLastSelectedToken({
                                                                    address: data.address,
                                                                    chain: data.chain,
                                                                })
                                                            }}
                                                            href={getTokenUrl(data.chain, data.address, isMobile)}
                                                            className="flex items-center justify-center gap-3 w-full"
                                                        >
                                                            <div className="relative">
                                                                <div className="bg-black min-w-8 min-h-8 max-w-8 max-h-8 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                                                                    {data.logo && data.logo.includes('https') && (
                                                                        <Image
                                                                            src={data.logo ?? TOKEN_PLACEHOLDER_IMAGE}
                                                                            alt={`${data.name} logo`}
                                                                            width={200}
                                                                            height={200}
                                                                            className=" w-full h-full object-cover object-center"
                                                                        />
                                                                    )}
                                                                </div>
                                                                <div className="absolute w-[15px] h-[15px] min-w-[15px] min-h-[15px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] flex items-center justify-center bg-black">
                                                                    <Image
                                                                        src={getChainImage(data.chain)}
                                                                        alt={`${data.name} logo`}
                                                                        width={100}
                                                                        height={100}
                                                                        className="rounded-full w-full h-full object-contain"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col mt-[0px]">
                                                                <span className="text-[12px] font-semibold  break-keep text-nowrapleading-none">
                                                                    {`${data.symbol}`}
                                                                </span>
                                                                <span className="text-[11px] leading-none">
                                                                    {getReadableNumber(data.mcap, undefined, '$')}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-end ml-auto flex-col justify-end  gap-1">
                                                                <span className="text-[11px] leading-none">
                                                                    {getReadableNumber(data.price, countDecimalPlaces(data.price ?? 0), '$')}
                                                                </span>
                                                                <span
                                                                    className={`text-2xs rounded px-1 py-[2px] leading-none  ${
                                                                        data.priceChange24h > 0
                                                                            ? 'text-positive bg-positive/10'
                                                                            : data.priceChange24h < 0
                                                                            ? 'text-negative bg-negative/10'
                                                                            : 'text-neutral-text'
                                                                    }`}
                                                                >
                                                                    {getReadableNumber(data.priceChange24h, 1)}%
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                )
                                            }
                                        })
                                    ) : (
                                        <EmptyData />
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center p-3 gap-1">
                            <button type="button" onClick={handleSignIn} className=" border-b border-white">
                                Sign in
                            </button>

                            <span> to view watchlist.</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FavouritesPanel
