import React, { useEffect, useState, useRef, useMemo } from 'react'

import Tag from '../Tag'
import PercentageChange from '../PercentageChange'
import { NewsItem } from '@/types/newstrading'

import { calculate24HourChange, formatCryptoPrice } from '@/utils/price'
import { getReadableDetailDate } from '@/utils/time'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { PairData } from '@/types/hyperliquid'
import Tooltip from '../Tooltip'
import { toast } from 'react-toastify'
import { useSettingsContext } from '@/context/SettingsContext'
import useIsMobile from '@/hooks/useIsMobile'
import { isWithinTimeWindow, NRS_CONFIG, getNRSTimerInfo } from '@/utils/nrs'
import { FaArrowRight, FaCheck } from 'react-icons/fa6'
import { BASE_URL } from '@/utils/string'
import { MdOutlineIosShare } from 'react-icons/md'
import { useKeyboardShortcutContext } from '@/context/KeyboardShortcutContext'
import PerpsOrderButton from '../PerpsOrderButton'
import { useNewsFeedPreferencesData } from '@/hooks/data/useNewsFeedPreferencesData'
import { getBorderColor, getImpactLabel } from '@/utils/newsItem'
import NRSMomentumBar from '../NRSMomentumBar'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { NewsItemPreviewLink } from '../NewsItemLinkPreview'

interface Props {
    data: NewsItem
    isUnread?: boolean
    index?: number
    showOnlyNewsFeedPanel?: boolean
    isTutorial?: boolean
    isFocused?: boolean
    onRead?: () => void
    updateFocusedNews?: (id: string) => void
    setTokenId: (ticker: string) => void
}

const NewsItemComponent = ({
    data,
    setTokenId,
    index,
    isUnread = false,
    isTutorial = false,
    isFocused = false,
    onRead,
    updateFocusedNews,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    showOnlyNewsFeedPanel,
}: Props) => {
    const { data: newsFeedPreferences } = useNewsFeedPreferencesData()
    const { setOnArrowRight, setOnArrowLeft } = useKeyboardShortcutContext()
    const { now, timezone } = useSettingsContext()

    const hoverStartTimeRef = useRef<number | null>(null)
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { elementRef, entry } = useIntersectionObserver<HTMLDivElement>({
        threshold: 0.1,
        once: false,
    })

    const isVisible = entry?.isIntersecting ?? false

    useEffect(() => {
        if (isUnread && onRead && isFocused) {
            onRead()
        }
    }, [isUnread, onRead, isFocused])

    // Constants for time-based limits
    const NRS_MAX_TIME_MS = NRS_CONFIG.NRS_MAX_TIME_MS // 10 minutes in milliseconds
    const MOMENTUM_MAX_TIME_MS = NRS_CONFIG.MOMENTUM_MAX_TIME_MS // 60 minutes in milliseconds

    // Memoized news publish timestamp
    const newsTime = useMemo(() => new Date(data.publishTime).getTime(), [data.publishTime])

    // Compute NRS timer info only when clock ticks
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const timerInfo = useMemo(() => getNRSTimerInfo(newsTime), [now, newsTime])

    // Compute validity flags without triggering re-renders every second
    const timeStatus = useMemo(() => {
        const isNrsValid = isWithinTimeWindow(newsTime, NRS_MAX_TIME_MS)
        const isMomentumValid = isWithinTimeWindow(newsTime, MOMENTUM_MAX_TIME_MS)
        const shouldShowNrs = now - newsTime < 3 * 24 * 60 * 60 * 1000 // show for 3 days
        return { isNrsValid, isMomentumValid, shouldShowNrs }
    }, [now, newsTime, NRS_MAX_TIME_MS, MOMENTUM_MAX_TIME_MS])

    const nrsMomentumData = data.latestIndicator?.[0]

    const isMobile = useIsMobile()
    const { tokenPairData } = usePairTokensContext()

    const [shareButtonClicked, setShareButtonClicked] = useState(false)
    const [selectedToken, setSelectedToken] = useState<undefined | PairData>(undefined)

    //  Memoize perpsTokens to avoid recalculating on every render
    const perpsTokens = useMemo(() => {
        if (!isVisible) return []
        const tokens: PairData[] = []

        if (data?.priceData?.length) {
            data.priceData.forEach(_token => {
                const token = tokenPairData.find(t => t?.pairs?.split('-')[0].toLowerCase() === _token.symbol.toLowerCase())
                if (token) tokens.push({ ...token, priceAtNews: _token.priceAtNews })
            })
        }

        if (newsFeedPreferences?.news?.presetTickers?.length) {
            newsFeedPreferences.news.presetTickers.forEach(ticker => {
                if (tokens.find(tok => tok.universe.name.toLowerCase() === ticker.toLowerCase())) return
                const token = tokenPairData.find(t => t?.pairs?.split('-')[0].toLowerCase() === ticker.toLowerCase())
                if (token) tokens.push({ ...token, priceAtNews: undefined })
            })
        }

        return tokens
    }, [data?.priceData, newsFeedPreferences?.news?.presetTickers, tokenPairData, isVisible])

    // Initialize selected token once when tokens are available
    useEffect(() => {
        if (!selectedToken && perpsTokens.length > 0) {
            setSelectedToken(perpsTokens[0])
            if (index === 0) setTokenId(perpsTokens[0].universe?.name)
        }
    }, [perpsTokens, selectedToken, setTokenId, index])

    // Handle arrow key navigation only when focused
    useEffect(() => {
        if (!isVisible || !isFocused || perpsTokens.length === 0) return

        const handleArrow = (direction: 'left' | 'right') => () => {
            const currentIndex = perpsTokens.findIndex(t => t.universe.name === selectedToken?.universe.name)
            const nextIndex =
                direction === 'right' ? (currentIndex + 1) % perpsTokens.length : (currentIndex - 1 + perpsTokens.length) % perpsTokens.length
            const newToken = perpsTokens[nextIndex]
            if (newToken) {
                setSelectedToken(newToken)
                setTokenId(newToken.universe.name)
            }
        }

        setOnArrowRight(handleArrow('right'))
        setOnArrowLeft(handleArrow('left'))
    }, [isFocused, selectedToken, perpsTokens, setOnArrowRight, setOnArrowLeft, setTokenId, isVisible])

    useEffect(() => {
        if (!isVisible) return

        let timer: NodeJS.Timeout | null = null

        if (isFocused && selectedToken) {
            timer = setTimeout(() => {
                // re-check before committing
                if (isFocused) {
                    setTokenId(selectedToken.universe?.name)
                }
            }, 300)
        }

        return () => {
            if (timer) clearTimeout(timer)
        }
    }, [isFocused, selectedToken, setTokenId, isVisible])

    return (
        <div
            ref={elementRef as React.RefObject<HTMLDivElement>}
            data-timestamp={data.publishTime}
            key={data.id}
            id={data.id}
            data-card
            className={`min-h-fit group relative  flex flex-col  border  rounded-lg news-item ${
                isFocused ? ' ring-2 ring-white/50 bg-neutral-950' : 'bg-neutral-950 '
            } 
            `}
            style={{ borderColor: getBorderColor(data.sentimentDirection ?? 'Neutral', data.sentimentMomentum ?? 'Low') }}
            onMouseEnter={() => {
                hoverStartTimeRef.current = Date.now()

                if (!isMobile && updateFocusedNews) {
                    // console.log('focused news:', data.id)

                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)

                    hoverTimeoutRef.current = setTimeout(() => {
                        const duration = Date.now() - (hoverStartTimeRef.current ?? 0)
                        if (duration >= 300) {
                            updateFocusedNews(data.id)
                        }
                    }, 300)
                }
            }}
            onMouseLeave={() => {
                if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
                hoverStartTimeRef.current = null
            }}
        >
            {/* Unread message indicator */}
            {isUnread && (
                <span className="absolute flex size-2 -top-[2px]  -right-[3px]">
                    {/* <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-negative opacity-75"></span> */}
                    <span className="relative inline-flex size-2 rounded-full bg-negative"></span>
                </span>
            )}
            <div className="flex flex-col p-2 gap-2 w-full border-b border-border relative">
                <div className="text-xs text-neutral-text/80 text-left  break-words overflow-hidden w-full text-highlight pr-2">{data.headline}</div>

                <div className=" flex justify-between text-[10px] text-neutral-text-dark items-end w-full min-h-fit">
                    <div id={isTutorial ? 'tutorial-sentiment-tag' : ''} className="flex flex-wrap gap-1 text-inherit ">
                        {data.newsType && typeof data.newsType === 'string' && (
                            <Tag variant={data.newsType}>
                                <span className=" capitalize">{data.newsType}</span>
                            </Tag>
                        )}

                        {data.sentimentMomentum && (
                            <Tag variant="neutral">
                                <span className={`${getImpactLabel(data.sentimentDirection ?? 'Neutral')} capitalize`}>{data.sentimentMomentum}</span>
                            </Tag>
                        )}

                        {data.categories && data.categories.length > 0 && (
                            <Tag variant="neutral">
                                <span className=" text-2xs leading-none text-inherit">
                                    <div>
                                        <span> {data.categories[0]}</span>
                                    </div>
                                </span>
                            </Tag>
                        )}
                        {timerInfo.phase === 'active' &&
                            timeStatus.isNrsValid &&
                            data.sentimentDirection === 'Bullish' &&
                            (data.sentimentMomentum === 'Medium' || data.sentimentMomentum === 'High') &&
                            nrsMomentumData &&
                            nrsMomentumData.nrs.action === 'buy' && <div className="text-sm">🔥</div>}
                    </div>
                    <div className="-mb-1 whitespace-nowrap">{getReadableDetailDate(data.publishTime, timezone)}</div>
                </div>
            </div>

            <div className="flex flex-col  w-full   text-inherit">
                {perpsTokens && perpsTokens.length > 0 && (
                    <div className="flex  items-center  border-b border-border text-xs rounded-md">
                        <div className="pl-2 pr-2 py-1 w-fit text-center text-2xs h-full flex flex-col items-center ">Tickers</div>
                        <div className="flex flex-wrap gap-1 pr-2 pl-2 py-1 w-full border-l border-border overflow-x-auto no-scrollbar">
                            {perpsTokens.map((token, index) => {
                                let isSelected = false
                                if (isMobile) {
                                    isSelected = selectedToken?.pairs === token.pairs
                                } else {
                                    isSelected = isFocused && selectedToken?.pairs === token.pairs
                                }

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => {
                                            setSelectedToken(token)
                                            setTokenId(token.universe.name)
                                        }}
                                        className={` border rounded-full hover:bg-neutral-900 focus:outline-none select-none  ${
                                            isSelected
                                                ? 'border-neutral-800 text-neutral-text bg-neutral-900'
                                                : '  text-neutral-text-dark border-border '
                                        }`}
                                    >
                                        <div className="text-2xs leading-none  rounded-full  py-[3px] px-[6px] ">
                                            <div className="flex items-center  h-full divide-x divide-neutral-800">
                                                <span className="px-1">{`${token.universe.name}`}</span>
                                                <span className="px-1">${formatCryptoPrice(token?.assetCtx?.markPx)}</span>
                                                {token.priceAtNews &&
                                                    (() => {
                                                        // Extract the percentage calculation
                                                        const priceChange =
                                                            calculate24HourChange({
                                                                markPx: token?.assetCtx?.markPx ?? '',
                                                                prevDayPx: token.priceAtNews?.toString() ?? '',
                                                            }) ?? 0

                                                        const percentage = priceChange / 100

                                                        return (
                                                            <Tooltip text="% price changes since news">
                                                                <PercentageChange
                                                                    size="extrasmall"
                                                                    width="w-fit"
                                                                    padding="px-1"
                                                                    percentage={percentage}
                                                                    isSelected={isSelected}
                                                                />
                                                            </Tooltip>
                                                        )
                                                    })()}

                                                <Tooltip text={`Max leverage for ${token.universe.name} is ${token.universe.maxLeverage}X`}>
                                                    <span className=" text-2xs leading-none text-inherit px-1">{`${token.universe.maxLeverage}X`}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {perpsTokens && perpsTokens.length === 0 && data && data.tokensUntradable && data.tokensUntradable.length > 0 && (
                    <div className="flex  items-center  border-b border-border text-xs rounded-md">
                        <div className="pl-2 pr-2 py-1 w-fit text-center text-2xs h-full flex flex-col items-center select-none">Tickers</div>
                        <div className="flex flex-wrap gap-2 pr-2 pl-2 py-1 w-full border-l border-border">
                            {data.tokensUntradable.map((token, index) => {
                                return (
                                    <Tooltip text={`${token} token is not supported`} key={index}>
                                        <div className="text-2xs leading-none  rounded-full  py-[3px]">
                                            <div className="flex items-center  h-full divide-x divide-neutral-800">
                                                <span className="px-1 text-neutral-text-dark">{`${token}`}</span>
                                            </div>
                                        </div>
                                    </Tooltip>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* {data.priceData && data.priceData.length > 0 && <>{getPriceChangeBeforeNews()}</>} */}

                {selectedToken && <PerpsOrderButton token={selectedToken} isFocused={isFocused} newsId={data.id} />}
            </div>

            {((data.source && data.sourceUrl) || (data.type && data.typeUrl)) && (
                <div className="text-2xs border-t border-border  flex items-center text-neutral-text-dark">
                    <div className="px-2 py-[2px] border-r border-border text-neutral-text-dark">Source</div>
                    <div className="flex flex-1 flex-wrap px-2 py-[2px] items-center">
                        {/* {data.type && data.typeUrl && (
                            <Link
                                href={data.typeUrl}
                                target="_blank"
                                className=" max-w-full hover:underline overflow-hidden text-left flex items-center gap-1 hover:text-neutral-text apply-transition focus:outline-none "
                            >
                                <span>{getTypeLabel(data.type ?? '')}</span>
                            </Link>
                        )} */}
                        {data.type && data.typeUrl && <NewsItemPreviewLink url={data.typeUrl} label={data.type} />}

                        {data.type && data.typeUrl && data.source && data.sourceUrl && <FaArrowRight className="text-[8px] mb-[1px] mx-1" />}

                        {data.source && data.sourceUrl && <NewsItemPreviewLink url={data.sourceUrl} label={data.source} />}
                    </div>

                    <button
                        onClick={event => {
                            event.stopPropagation()
                            navigator.clipboard.writeText(`${BASE_URL}/news/${data.id}`)
                            toast.success('Share link copied to clipboard successfully.')
                            setShareButtonClicked(true)
                            setTimeout(() => {
                                setShareButtonClicked(false)
                            }, 3000)
                        }}
                        title="Share news"
                        type="button"
                        className="pointer-events-auto flex z-10 min-w-6 min-h-6 aspect-square items-center  hover:bg-neutral-900 justify-center text-neutral-text-dark hover:text-neutral-text  border-border border-l  apply-transition"
                    >
                        {shareButtonClicked ? <FaCheck className="text-xs" /> : <MdOutlineIosShare className="text-xs" />}
                    </button>
                </div>
            )}

            {/* NRS Signal Display - Enhanced with timer */}
            {nrsMomentumData &&
                timeStatus.shouldShowNrs &&
                data.sentimentDirection === 'Bullish' &&
                (data.sentimentMomentum === 'Medium' || data.sentimentMomentum === 'High') && (
                    <div className="text-2xs border-t border-border flex flex-col px-2 py-1">
                        {/* Timer Display - Only show for waiting and active phases */}
                        {timerInfo.phase === 'waiting' && (
                            <div className="flex items-center justify-between">
                                <Tooltip text="News Reaction Score (NRS) - Analyzes price and volume reaction to news events to generate trading signals">
                                    <span className={`font-semibold cursor-help`}>NRS Signal:</span>
                                </Tooltip>
                                <span className={`text-2xs ${timerInfo.phase === 'waiting' ? 'text-yellow-400' : 'text-neutral-text-dark'}`}>
                                    {timerInfo.timeRemaining} Until NRS
                                </span>
                            </div>
                        )}

                        {/* NRS Signal - Show based on phase and only if active signal */}
                        {((timerInfo.phase === 'active' && nrsMomentumData) ||
                            (timerInfo.phase === 'historical' && nrsMomentumData) ||
                            isTutorial) && (
                            <div id={isTutorial ? 'tutorial-nrs' : ''} className="flex items-center justify-between">
                                <Tooltip text="News Reaction Score (NRS) - Analyzes price and volume reaction to news events to generate trading signals">
                                    <span
                                        className={`font-semibold cursor-help ${timerInfo.phase === 'historical' ? 'text-neutral-text-dark/60' : ''}`}
                                    >
                                        NRS Signal:
                                    </span>
                                </Tooltip>
                                <div className="flex items-center gap-2">
                                    {nrsMomentumData && (
                                        <Tooltip
                                            text={`${nrsMomentumData.nrs.action}${timerInfo.phase === 'historical' ? ' (Historical - M1)' : ''}`}
                                        >
                                            <span
                                                className={`font-medium ${
                                                    nrsMomentumData.nrs.action === 'buy'
                                                        ? timerInfo.phase === 'historical'
                                                            ? 'text-neutral-text-dark/60'
                                                            : 'text-positive'
                                                        : nrsMomentumData.nrs.action === 'fade'
                                                        ? timerInfo.phase === 'historical'
                                                            ? 'text-neutral-text-dark/60'
                                                            : 'text-negative'
                                                        : nrsMomentumData.nrs.action === 'watch'
                                                        ? timerInfo.phase === 'historical'
                                                            ? 'text-neutral-text-dark/60'
                                                            : 'text-yellow-500'
                                                        : 'text-neutral-text-dark'
                                                }`}
                                            >
                                                {nrsMomentumData.nrs.emoji} {nrsMomentumData.nrs.description}
                                            </span>
                                        </Tooltip>
                                    )}
                                    {/* Show historical indicator inline */}
                                    {timerInfo.phase === 'active' && (
                                        <span className="text-2xs text-neutral-text-dark/60">({timerInfo.timeRemaining})</span>
                                    )}
                                    {timerInfo.phase === 'historical' && <span className="text-2xs text-neutral-text-dark/60">(expired)</span>}
                                </div>
                            </div>
                        )}

                        {/* Momentum Bar - Only show if momentum is still valid and not historical */}
                        {(isTutorial ||
                            (timerInfo.phase !== 'waiting' &&
                                timeStatus.isMomentumValid &&
                                data.sentimentDirection === 'Bullish' &&
                                (data.sentimentMomentum === 'Medium' || data.sentimentMomentum === 'High') &&
                                nrsMomentumData &&
                                (nrsMomentumData.nrs.action === 'buy' || nrsMomentumData.nrs.action === 'watch'))) && (
                            <div id={isTutorial ? 'tutorial-momentum' : ''} className="flex items-center justify-between">
                                <span className="font-semibold mr-2">Momentum:</span>
                                <NRSMomentumBar vwpd={nrsMomentumData.momentum?.vwpd ?? 0} />
                            </div>
                        )}
                    </div>
                )}
        </div>
    )
}

export default NewsItemComponent
