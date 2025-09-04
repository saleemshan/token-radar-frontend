// import React, { useCallback, useEffect, useRef, useState } from 'react'
// import TradFiItem from './TradFiItem'
// import { useRefetchOnWake } from '@/hooks/useRefetchOnWake'
// import axios from 'axios'
// import { TradfiItem } from '@/types/newstrading'
// import Spinner from '../Spinner'

// const FastNewsPanel = () => {
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const [page, setPage] = useState(1)
//     const [loading, setLoading] = useState(false)
//     const [hasMore, setHasMore] = useState(false)
//     const [news, setNews] = useState<TradfiItem[]>([])

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const scrollElementRef = useRef<any>(null)

//     const handleFetchNews = useCallback(
//         async (pageNum: number) => {
//             if (loading) return

//             try {
//                 setLoading(true)

//                 const response = await axios.get(`/api/news-trading/tradfi/fast`, {
//                     params: {
//                         page: pageNum,
//                         limit: 20,
//                     },
//                 })

//                 const newsData = response.data.data.news
//                 if (Array.isArray(newsData)) {
//                     // Add isUnread: false for fetched news (since they're not new/live)
//                     const newsWithUnread = newsData.map((item: TradfiItem) => ({ ...item, isUnread: false }))
//                     if (pageNum === 1) {
//                         setNews(newsWithUnread)
//                     } else {
//                         setNews(prev => [...prev, ...newsWithUnread])
//                     }
//                     setHasMore(pageNum < response.data.data.pagination.totalPages)
//                 } else {
//                     console.warn('News data is not available:', response.data)
//                 }
//             } catch (error) {
//                 console.error('Error fetching news:', error)
//             } finally {
//                 setTimeout(() => {
//                     setLoading(false)
//                 }, 750)
//             }
//         },
//         [loading]
//     )

//     useRefetchOnWake(() => {
//         setNews([])
//         handleFetchNews(1)
//     })

//     useEffect(() => {
//         if (!IntersectionObserver) {
//             console.warn('IntersectionObserver is not supported in this environment.')
//             return
//         }

//         const scrollObserver = new IntersectionObserver(
//             entries => {
//                 entries.forEach(entry => {
//                     if (entry?.isIntersecting && hasMore && !loading) {
//                         setPage(prev => {
//                             const nextPage = prev + 1
//                             handleFetchNews(nextPage)
//                             return nextPage
//                         })
//                     }
//                 })
//             },
//             {
//                 root: null,
//                 rootMargin: '0px',
//                 threshold: 1.0,
//             }
//         )

//         if (scrollElementRef.current) {
//             scrollObserver.observe(scrollElementRef.current)
//         }

//         return () => {
//             scrollObserver.disconnect()
//         }
//     }, [hasMore, loading, handleFetchNews])

//     useEffect(() => {
//         handleFetchNews(1)
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [])

//     return (
//         <div className="max-h-full h-full overflow-y-auto divide-y divide-border flex flex-col  relative">
//             <>
//                 {news && news.length > 0 ? (
//                     news.map((data, index) => {
//                         return <TradFiItem key={`${data.id}-${index}`} data={data} />
//                     })
//                 ) : (
//                     <>{!loading && <div className="p-2 text-sm">No data found</div>}</>
//                 )}

//                 <div ref={scrollElementRef as React.RefObject<HTMLDivElement>} className="flex justify-center min-h-[2px] w-full"></div>
//                 {loading && (
//                     <div className="flex items-center justify-center w-full space-x-2 pb-3 ">
//                         <Spinner />
//                     </div>
//                 )}
//             </>
//         </div>
//     )
// }

// export default FastNewsPanel
