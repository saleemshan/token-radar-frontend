'use client'

import { useCallback, RefObject } from 'react'

interface UseContainerAutoScrollReturn {
    scrollToTop: () => void
    scrollToBottom: () => void
    shouldScrollToTop: () => boolean
}

const useContainerAutoScroll = (ref: RefObject<HTMLElement>): UseContainerAutoScrollReturn => {
    const shouldScrollToTop = useCallback(() => {
        if (ref.current) {
            // Check if we're within the top 25% of the content
            const scrollTop = ref.current.scrollTop
            const clientHeight = ref.current.clientHeight

            // Calculate the threshold as 25% of the visible area
            const threshold = clientHeight * 0.25

            return scrollTop <= threshold
        }
        return false
    }, [ref])

    const scrollToTop = useCallback(() => {
        if (ref.current) {
            ref.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            })
        }
    }, [ref])

    const scrollToBottom = useCallback(() => {
        if (ref.current) {
            const currentScrollTop = ref.current.scrollTop
            const scrollHeight = ref.current.scrollHeight
            const clientHeight = ref.current.clientHeight

            const distanceToBottom = scrollHeight - (currentScrollTop + clientHeight)
            const scrollThreshold = clientHeight * 0.2
            const isNearBottom = distanceToBottom < 100
            const isScrolledDown = currentScrollTop > scrollHeight - clientHeight - scrollThreshold

            if (isNearBottom || isScrolledDown) {
                ref.current.scrollTo({
                    top: scrollHeight,
                    behavior: 'smooth',
                })
            }
        }
    }, [ref])

    return { scrollToTop, scrollToBottom, shouldScrollToTop }
}

export default useContainerAutoScroll
