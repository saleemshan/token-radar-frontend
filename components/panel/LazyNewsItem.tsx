import React, { useEffect, useState } from 'react'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { NewsItem } from '@/types/newstrading'
import NewsItemComponent from './NewsItem'
import NewsItemSkeleton from './NewsItemSkeleton'

interface LazyNewsItemProps {
    data: NewsItem
    setTokenId: (ticker: string) => void
    index?: number
    isUnread?: boolean
    isTutorial?: boolean
    isFocused?: boolean
    onRead?: () => void
    updateFocusedNews?: (id: string) => void
    showOnlyNewsFeedPanel?: boolean
}

const LazyNewsItem = (props: LazyNewsItemProps) => {
    const [hasBeenVisible, setHasBeenVisible] = useState(false)

    const { elementRef, entry } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '200px 0px 200px 0px', // preload buffer
    })

    useEffect(() => {
        if (entry?.isIntersecting) setHasBeenVisible(true)
    }, [entry])

    return (
        <div ref={elementRef as React.RefObject<HTMLDivElement>} className="min-h-fit">
            {hasBeenVisible ? <NewsItemComponent {...props} /> : <NewsItemSkeleton />}
        </div>
    )
}

export default LazyNewsItem
