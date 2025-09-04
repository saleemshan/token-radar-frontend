import React, { useCallback, useEffect, useRef, useState } from 'react'
import TradFiItem from './TradFiItem'
import axios from 'axios'
import { TradfiItem } from '@/types/newstrading'
import Spinner from '../Spinner'
import { useRefetchSignal } from '@/context/RefetchContext'
import EmptyData from '../global/EmptyData'
import TradFiItemSkeleton from './TradFiItemSkeleton'

const TradFiSocialPanel = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [page, setPage] = useState(1)
    const [initialFetched, setInitialFetched] = useState(false)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(false)
    const [news, setNews] = useState<TradfiItem[]>([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scrollElementRef = useRef<any>(null)

    const handleFetchNews = useCallback(
        async (pageNum: number) => {
            if (loading || !pageNum) return

            try {
                setLoading(true)

                const response = await axios.get(`/api/news-trading/tradfi/social`, {
                    params: {
                        page: pageNum,
                        limit: 20,
                    },
                })

                if (!initialFetched) setInitialFetched(true)

                const newsData = response.data.data.news
                if (Array.isArray(newsData)) {
                    // Add isUnread: false for fetched news (since they're not new/live)
                    const newsWithUnread = newsData.map((item: TradfiItem) => ({ ...item, isUnread: false }))
                    if (pageNum === 1) {
                        setNews(newsWithUnread)
                    } else {
                        setNews(prev => [...prev, ...newsWithUnread])
                    }
                    setHasMore(pageNum < response.data.data.pagination.totalPages)
                } else {
                    console.warn('News data is not available:', response.data)
                }
            } catch (error) {
                console.error('Error fetching news:', error)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 750)
            }
        },
        [loading]
    )

    const containerRef = useRef<HTMLDivElement | null>(null)
    const refetchSignal = useRefetchSignal()
    const lastHandledSignal = useRef(0)

    useEffect(() => {
        if (refetchSignal !== lastHandledSignal.current) {
            lastHandledSignal.current = refetchSignal
            if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production') console.log('Refetch | Idle for too long, refetching social data')
            handleFetchNews(1)
            if (containerRef.current) {
                containerRef.current.scrollTo({ top: 0 })
            }
        }
    }, [refetchSignal, handleFetchNews])

    useEffect(() => {
        let observer: IntersectionObserver | null = null
        // eslint-disable-next-line prefer-const
        let intervalId: NodeJS.Timeout

        const tryObserve = () => {
            const target = scrollElementRef.current
            if (!target) return

            observer = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => {
                        const nextPage = prev + 1
                        handleFetchNews(nextPage)
                        return nextPage
                    })
                }
            })

            observer.observe(target)
            clearInterval(intervalId) // Stop polling once attached
        }

        intervalId = setInterval(() => {
            if (scrollElementRef.current) {
                tryObserve()
            }
        }, 100)

        return () => {
            if (observer && scrollElementRef.current) {
                // eslint-disable-next-line react-hooks/exhaustive-deps
                observer.unobserve(scrollElementRef.current)
                observer.disconnect()
            }
            clearInterval(intervalId)
        }
    }, [hasMore, loading, handleFetchNews])

    const handleTradFiSettingsUpdated = () => {
        setNews([])
        handleFetchNews(1)
    }

    useEffect(() => {
        handleFetchNews(1)

        window.addEventListener('tradFiSettingsUpdated', handleTradFiSettingsUpdated)
        return () => {
            window.removeEventListener('tradFiSettingsUpdated', handleTradFiSettingsUpdated)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="max-h-full h-full overflow-y-auto divide-y divide-border flex flex-col flex-1 relative focus:outline-none" ref={containerRef}>
            {initialFetched ? (
                <>
                    {news && news.length > 0 ? (
                        news.map((data, index) => {
                            return <TradFiItem showAvatar={true} key={`${data.id}-${index}`} data={data} />
                        })
                    ) : (
                        <>{!loading && <EmptyData />}</>
                    )}

                    <div ref={scrollElementRef as React.RefObject<HTMLDivElement>} className="flex justify-center min-h-[2px] w-full"></div>
                    {loading && (
                        <div className="flex items-center justify-center w-full space-x-2 pb-3 ">
                            <Spinner />
                        </div>
                    )}
                </>
            ) : (
                <div className="max-h-full overflow-hidden">
                    {Array.from({ length: 20 }).map((_, idx) => (
                        <TradFiItemSkeleton key={idx} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default TradFiSocialPanel
