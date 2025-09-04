'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NewsItem } from '@/types/newstrading'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { FaXmark } from 'react-icons/fa6'
import { useSearchParams } from 'next/navigation'
import { useNewsTradingContext } from '@/context/NewsTradingContext'
import { getAccessToken } from '@privy-io/react-auth'
import { connectSocket, disconnectSocket } from '@/lib/newsFeedSocket'
import useContainerAutoScroll from '@/hooks/useContainerAutoScroll'
import { useUserNotificationPreferencesData } from '@/hooks/data/useUserNotificationPreferencesData'
import { useUserAgent } from '@/hooks/useUserAgent'
import { usePushNotificationSubscription } from '@/hooks/usePushNotificationSubscription'
import { newsItemDummyData } from '@/data/dummy/newsItems'
import { useRefetchSignal } from '@/context/RefetchContext'
import { useKeyboardShortcutContext } from '@/context/KeyboardShortcutContext'
import { useMobileScrollIntersectionObserver } from '@/hooks/useMobileScrollIntersectionObserver'
import axiosLib from '@/lib/axios'

import Spinner from '../Spinner'
import EmptyData from '../global/EmptyData'
import NewsItemComponent from '@/components/panel/NewsItem'
import NewsItemSkeleton from './NewsItemSkeleton'
import LazyNewsItem from './LazyNewsItem'

const NewsFeedPanel = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    selectedTokenId,
    showOnlyNewsFeedPanel,
    showSearchInput,
    setSelectedTokenId,
    setShowSearchInput,
}: {
    selectedTokenId: string | undefined
    showOnlyNewsFeedPanel: boolean
    showSearchInput: boolean
    setSelectedTokenId: (ticker: string) => void
    setShowSearchInput: (showSearchInput: boolean) => void
}) => {
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()

    const { newsFeedFetched, setNewsFeedFetched } = useNewsTradingContext()
    const { isDesktop, isSafari } = useUserAgent()
    const { isSubscribed } = usePushNotificationSubscription()
    const { setOnArrowUp, setOnArrowDown } = useKeyboardShortcutContext()
    const { focusedItem: focusedCard, containerRef } = useMobileScrollIntersectionObserver({
        rootMargin: '0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0],
    })

    const { data: notificationPreferencesData } = useUserNotificationPreferencesData()
    const silentRef = useRef(notificationPreferencesData?.preferences?.silent)
    const isSubscribedRef = useRef(false)

    const [focusedNewsId, setFocusedNewsId] = useState<string | undefined>(undefined)

    useEffect(() => {
        isSubscribedRef.current = isSubscribed
    }, [isSubscribed])

    useEffect(() => {
        silentRef.current = notificationPreferencesData?.preferences?.silent
    }, [notificationPreferencesData?.preferences?.silent])

    const [isSearching, setIsSearching] = useState(false)
    const [searchInput, setSearchInput] = useState('')

    const [news, setNews] = useState<NewsItem[]>([])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingSpinner, setLoadingSpinner] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const searchParams = useSearchParams()
    const [initialLoaded, setInitialLoaded] = useState(false)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrollElementRef = useRef<any>(null)
    const scrollContainerRef = useRef<HTMLDivElement | null>(null)
    const { shouldScrollToTop, scrollToTop } = useContainerAutoScroll(scrollContainerRef)

    const [showTutorialExample, setShowTutorialExample] = useState(false)

    let scrollRaf: number
    const scrollToItem = (element: HTMLElement) => {
        if (scrollRaf) cancelAnimationFrame(scrollRaf)

        scrollRaf = requestAnimationFrame(() => {
            if (!scrollContainerRef.current) return

            const containerRect = scrollContainerRef.current.getBoundingClientRect()
            const itemRect = element.getBoundingClientRect()

            const scrollOffset = itemRect.top - containerRect.top
            const scrollCenter = scrollOffset - containerRect.height / 2 + itemRect.height / 2

            scrollContainerRef.current.scrollBy({
                top: scrollCenter,
                // behavior: 'smooth',
            })
        })
    }

    useEffect(() => {
        if (typeof window === 'undefined') return

        if (window.innerWidth < 768) return

        const accepted = localStorage.getItem('newsTradingAgreementAccepted')
        const dismissed = localStorage.getItem('crush_intro_news_trading_page')

        // Only show tutorial if user has accepted agreement AND referral check is complete
        if (accepted === 'true' && dismissed !== 'true') {
            setShowTutorialExample(true)
        }
    }, [])

    // Additional check to prevent tutorial during referral process
    useEffect(() => {
        const checkReferralStatus = () => {
            const dismissed = localStorage.getItem('crush_intro_news_trading_page')
            if (dismissed === 'true') {
                setShowTutorialExample(false)
            }
        }

        // Check immediately
        checkReferralStatus()

        // Check periodically to catch any changes
        const interval = setInterval(checkReferralStatus, 500)

        return () => clearInterval(interval)
    }, [])

    // Listen for referral modal events to control tutorial visibility
    useEffect(() => {
        const handleReferralModalOpen = () => {
            // Hide tutorial when referral modal is open
            setShowTutorialExample(false)
        }

        const handleReferralCompleted = () => {
            // Show tutorial after referral is completed
            const accepted = localStorage.getItem('newsTradingAgreementAccepted')
            const dismissed = localStorage.getItem('crush_intro_news_trading_page')

            if (accepted === 'true' && dismissed !== 'true') {
                setShowTutorialExample(true)
            }
        }

        window.addEventListener('referral-modal-open', handleReferralModalOpen)
        window.addEventListener('referral-completed', handleReferralCompleted)

        return () => {
            window.removeEventListener('referral-modal-open', handleReferralModalOpen)
            window.removeEventListener('referral-completed', handleReferralCompleted)
        }
    }, [])

    const handleFetchNews = useCallback(
        async (pageNum: number, query?: string, searchAll?: boolean) => {
            if (!ready || !authenticated) return
            if (loading || !pageNum) return

            try {
                setLoading(true)
                setLoadingSpinner(true)

                const response = await axiosLib.get(`/api/news-trading/feed`, {
                    params: {
                        page: pageNum,
                        limit: 20,
                        query: query !== undefined ? query : searchInput,
                        searchAll,
                    },
                })

                if (!newsFeedFetched) setNewsFeedFetched(true)

                const newsData = response.data.data.news

                if (Array.isArray(newsData)) {
                    if (!query && !searchInput) {
                        const MAX_ITEMS = 200
                        const trimmed = newsData.slice(0, MAX_ITEMS)
                        localStorage.setItem('newsTradingFeed', JSON.stringify(trimmed))
                    }

                    // Add isUnread: false for fetched news (since they're not new/live)
                    const newsWithUnread = newsData.map((item: NewsItem) => ({ ...item, isUnread: false }))
                    if (pageNum === 1) {
                        setNews(newsWithUnread)
                        setFocusedNewsId(newsWithUnread[0]?.id)
                    } else {
                        setNews(prev => [...prev, ...newsWithUnread])
                    }

                    setHasMore(
                        response.data.data.pagination.totalPages != 0 && pageNum < response.data.data.pagination.totalPages && newsData.length > 0
                    )
                    setPage(pageNum)
                } else {
                    console.warn('News data is not available:', response.data)
                }
            } catch (error) {
                console.error('Error fetching news:', error)
            } finally {
                setLoadingSpinner(false)
                setTimeout(() => {
                    setLoading(false)
                    setIsSearching(false)
                }, 750)
            }
        },
        [loading, ready, authenticated, searchInput]
    )

    const handleUpdateTradingFilters = useCallback(() => {
        setNews([])
        handleFetchNews(1)
    }, [handleFetchNews])

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length <= 0) {
            //fetch initial news feed
            setNews([])
            handleFetchNews(1, '')
            setIsSearching(true)
        }
        setSearchInput(e.target.value)
    }

    const handleMoveFocusedNewsItem = useCallback(
        (direction: 'up' | 'down') => {
            const currentIndex = news.findIndex(item => item.id === focusedNewsId)
            if (currentIndex === -1) return

            const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
            if (nextIndex < 0 || nextIndex >= news.length) return

            const newFocusedNewsId = news[nextIndex].id

            setFocusedNewsId(newFocusedNewsId)

            //scroll to focused news item
            const newsItem = document.getElementById(newFocusedNewsId)
            if (newsItem) scrollToItem(newsItem)
        },
        [news, focusedNewsId, setFocusedNewsId, scrollContainerRef]
    )

    const newsDingAudioRef = useRef<HTMLAudioElement | null>(null)

    const refetchSignal = useRefetchSignal()
    const lastHandledSignal = useRef(0)

    const handleSearchQuery = () => {
        setNews([])
        handleFetchNews(1)
        setIsSearching(true)
    }

    useEffect(() => {
        if (!focusedCard || news.length === 0) return

        const handler = setTimeout(() => {
            const newsItem = news.find(item => item.id === focusedCard)
            // console.log('Focused news item:', newsItem)

            if (newsItem) {
                setFocusedNewsId(newsItem.id)
            }
        }, 400) // adjust debounce delay

        return () => clearTimeout(handler)
    }, [focusedCard, news])

    useEffect(() => {
        if (refetchSignal !== lastHandledSignal.current) {
            lastHandledSignal.current = refetchSignal
            if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('Refetch | Idle for too long, refetching News Feed data')
            handleFetchNews(1)
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0 })
            }
        }
    }, [refetchSignal, handleFetchNews])

    useEffect(() => {
        //websocket news
        const isAtTop = shouldScrollToTop()

        if (isAtTop) {
            scrollToTop()
        }
    }, [news, scrollToTop, shouldScrollToTop])

    useEffect(() => {
        //Initial fetch
        if (ready && authenticated && !initialLoaded) {
            const query = searchParams.get('query')

            if (query) {
                setShowSearchInput(true)
                setSearchInput(query)
                handleFetchNews(1, query, true)
            } else {
                handleFetchNews(1)
            }

            setInitialLoaded(true)
        }
    }, [ready, authenticated, handleFetchNews, searchParams, initialLoaded])

    const fetchingRef = useRef(false)

    const onIntersect = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            if (entries[0].isIntersecting && hasMore && !loading && !isSearching && !fetchingRef.current) {
                fetchingRef.current = true
                handleFetchNews(page + 1).finally(() => {
                    fetchingRef.current = false
                })
            }
        },
        [hasMore, loading, isSearching, handleFetchNews, page]
    )

    useEffect(() => {
        if (!scrollElementRef.current) return
        const observer = new IntersectionObserver(onIntersect)
        observer.observe(scrollElementRef.current)
        return () => observer.disconnect()
    }, [onIntersect])

    useEffect(() => {
        //Conect to news feed websocket
        if (!ready || !authenticated) return

        let isConnected = false

        const setupSocket = () => {
            connectSocket({
                url: process.env.NEXT_PUBLIC_NEWS_SOCKET,
                getPrivyToken: async () => {
                    const token = await getAccessToken()
                    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development') console.log('News Feed |Token from getPrivyToken', token)
                    return token ?? undefined
                },
                onStatusChange: status => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Status:', status)
                },
                onReconnectStatus: msg => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Reconnect:', msg)
                },
                onHeartbeat: () => {
                    const formattedDate = new Date()
                        .toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                        })
                        .replace(',', ' -')
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Websocket Live', formattedDate)
                },
                onNews: data => {
                    if (data) {
                        if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Websocket:', data)

                        setNews(prev => [{ ...data, isLive: true, isUnread: true }, ...prev])

                        //Only play audio on desktop browsers, except safari
                        if (isSubscribedRef.current && isDesktop && !isSafari && silentRef.current === false) {
                            newsDingAudioRef.current?.play()
                        }
                    }
                },
                onPreferencesLoaded: () => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Preferences Loaded')
                },
                onSubscriptionSuccess: channel => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Subscribed to', channel)
                },
                onSubscriptionError: async (channel, error) => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.error(`News Feed | Sub error on ${channel}:`, error)
                },
                onServerMessage: msg => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Server:', msg)
                },
                clearUserData: () => {
                    if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('News Feed | Clearing user data...')
                },
            })

            isConnected = true
        }

        setupSocket()

        return () => {
            if (isConnected) disconnectSocket()
        }
    }, [ready, authenticated, isDesktop, isSafari])

    useEffect(() => {
        const handleStorageChange = () => {
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setShowTutorialExample(false)
                return
            }
            const accepted = localStorage.getItem('newsTradingAgreementAccepted')

            if (!accepted || accepted !== 'true') {
                setShowTutorialExample(false)
                return
            }

            const hasSeen = JSON.parse(localStorage.getItem('crush_intro_news_trading_page') ?? 'false')

            setShowTutorialExample(!hasSeen)
        }

        newsDingAudioRef.current = new window.Audio('/sfx/notification.mp3')

        const newsTradingFeed = localStorage.getItem('newsTradingFeed')

        if (newsTradingFeed) {
            setNews(JSON.parse(newsTradingFeed))
        }

        window.addEventListener('crush-intro', handleStorageChange)

        return () => {
            window.removeEventListener('crush-intro', handleStorageChange)
        }
    }, [])

    useEffect(() => {
        const handleClearNewsTradingFeed = () => {
            setNews([])
        }

        window.addEventListener('clearNewsTradingFeed', handleClearNewsTradingFeed)

        return () => {
            window.removeEventListener('clearNewsTradingFeed', handleClearNewsTradingFeed)
        }
    }, [])

    useEffect(() => {
        setOnArrowDown(() => {
            handleMoveFocusedNewsItem('down')
        })
        setOnArrowUp(() => {
            handleMoveFocusedNewsItem('up')
        })
    }, [setOnArrowDown, setOnArrowUp, handleMoveFocusedNewsItem])

    useEffect(() => {
        if (ready && authenticated) {
            window.addEventListener('newsTradingFiltersUpdated', handleUpdateTradingFilters)
            return () => {
                window.removeEventListener('newsTradingFiltersUpdated', handleUpdateTradingFilters)
            }
        }
    }, [ready, authenticated, handleUpdateTradingFilters])

    //check for search params query, if exist show search input box and populate the input with the query

    return (
        <>
            <div className="relative z-[101] w-full  min-h-full max-h-full flex flex-col  pointer-events-auto  border-border  bg-black overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden h-full max-h-full relative">
                    {showSearchInput && (
                        <form
                            className="relative"
                            onSubmit={e => {
                                e.preventDefault()
                                handleSearchQuery()
                            }}
                        >
                            <input
                                value={searchInput}
                                placeholder="Search"
                                className="w-full  h-full p-2 px-3 focus:outline-none text-neutral-text bg-table-even text-base focus:bg-neutral-odd border-b border-border"
                                onChange={handleSearchInputChange}
                            />
                            {searchInput && searchInput.length > 0 && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 items-center ">
                                    <button
                                        onClick={() => {
                                            setSearchInput('')
                                            handleFetchNews(1, '')
                                        }}
                                        type="button"
                                        className=" rounded p-1 w-5 h-5 flex items-center bg-table-odd hover:bg-neutral-900 justify-center text-neutral-text border border-border  apply-transition"
                                    >
                                        <FaXmark className="text-2xs" />
                                    </button>
                                </div>
                            )}
                        </form>
                    )}

                    <div className="w-full flex flex-col flex-1 overflow-hidden" ref={containerRef}>
                        <div
                            id="news-feed-panel"
                            className="max-h-full min-h-full overflow-y-auto gap-2 flex flex-col p-2 relative flex-1"
                            ref={scrollContainerRef}
                        >
                            {authenticated && showTutorialExample && (
                                <NewsItemComponent
                                    key="example-news-tutorial"
                                    data={newsItemDummyData}
                                    isTutorial={true}
                                    setTokenId={setSelectedTokenId}
                                    isUnread={true}
                                    onRead={() => {}}
                                    showOnlyNewsFeedPanel={showOnlyNewsFeedPanel}
                                />
                            )}

                            {news && news.length > 0 ? (
                                <>
                                    {news.map((data, index) => {
                                        return (
                                            <LazyNewsItem
                                                key={`${data.id}-${index}`}
                                                index={index}
                                                data={data}
                                                setTokenId={setSelectedTokenId}
                                                isUnread={data.isUnread}
                                                isFocused={focusedNewsId !== undefined ? focusedNewsId === data.id : false}
                                                onRead={() => {
                                                    setNews(prev => prev.map(item => (item.id === data.id ? { ...item, isUnread: false } : item)))
                                                }}
                                                updateFocusedNews={id => {
                                                    setFocusedNewsId(id)
                                                }}
                                                showOnlyNewsFeedPanel={showOnlyNewsFeedPanel}
                                            />
                                        )
                                    })}
                                </>
                            ) : (
                                <>
                                    {loading ? (
                                        <div className="flex-1 flex items-center justify-center w-full flex-col overflow-hidden">
                                            <div className="flex-1 flex flex-col w-full overflow-hidden gap-2">
                                                {Array.from({ length: 10 }).map((_, index) => (
                                                    <NewsItemSkeleton key={index} />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {ready && authenticated ? (
                                                <EmptyData />
                                            ) : (
                                                <div className="w-full flex-1 flex items-center justify-center p-3 gap-1">
                                                    <button onClick={handleSignIn} type="button" className="underline">
                                                        Sign in
                                                    </button>
                                                    to view news feed
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            <div
                                ref={scrollElementRef as React.RefObject<HTMLDivElement>}
                                className="flex justify-center min-h-[2px] w-full bg-transparent "
                            ></div>
                            {loadingSpinner && news.length !== 0 && (
                                <div className="flex items-center justify-center w-full space-x-2 pb-3 ">
                                    <Spinner />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default NewsFeedPanel
