import { useState, useEffect, useRef, RefObject } from 'react'
import useIsMobile from './useIsMobile'

const mapsAreEqual = (map1: Map<string, number>, map2: Map<string, number>): boolean => {
    if (map1.size !== map2.size) return false

    const map1Entries = Array.from(map1.entries())
    for (const [key, value] of map1Entries) {
        if (!map2.has(key) || Math.abs(map2.get(key)! - value) > 0.001) {
            return false
        }
    }
    return true
}

interface UseMobileScrollIntersectionObserverOptions {
    root?: Element | null
    rootMargin?: string
    threshold?: number | number[]
}

interface UseMobileScrollIntersectionObserverReturn {
    visibleItems: Map<string, number>
    focusedItem: string | null
    containerRef: RefObject<HTMLDivElement>
}

export const useMobileScrollIntersectionObserver = (
    options: UseMobileScrollIntersectionObserverOptions = {}
): UseMobileScrollIntersectionObserverReturn => {
    const isMobile = useIsMobile()

    const [visibleItems, setVisibleItems] = useState<Map<string, number>>(new Map())
    const [focusedItem, setFocusedItem] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const { root = null, rootMargin = '0px', threshold = [0, 0.1, 0.25, 0.5, 0.75, 1.0] } = options

    // Intersection Observer setup with intersection ratio tracking
    useEffect(() => {
        if (!isMobile) return

        const observer = new IntersectionObserver(
            entries => {
                setVisibleItems(prev => {
                    const newVisibleItems = new Map(prev)

                    entries.forEach(entry => {
                        if (entry.isIntersecting && entry.intersectionRatio > 0) {
                            newVisibleItems.set(entry.target.id, entry.intersectionRatio)
                        } else {
                            newVisibleItems.delete(entry.target.id)
                        }
                    })

                    // Only update if the maps are actually different
                    if (mapsAreEqual(prev, newVisibleItems)) {
                        return prev // Return the same reference to prevent unnecessary re-renders
                    }

                    return newVisibleItems
                })
            },
            {
                root: root || containerRef.current,
                rootMargin,
                threshold,
            }
        )

        const items = containerRef.current?.querySelectorAll('[data-card]')
        items?.forEach(item => observer.observe(item))

        return () => {
            items?.forEach(item => observer.unobserve(item))
        }
    }, [root, rootMargin, threshold, isMobile])

    // Determine the focused item based on highest intersection ratio
    useEffect(() => {
        if (!isMobile) return
        if (visibleItems.size === 0) {
            setFocusedItem(prev => (prev === null ? prev : null))
            return
        }

        const container = document.getElementById('news-feed-panel')
        if (!container) return

        const isAtTop = container.scrollTop <= 5
        const isAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5

        // console.log({ currentscrolltop: container.scrollTop, isAtTop, isAtBottom })

        if (isAtTop || isAtBottom) {
            const container = containerRef.current
            if (!container) return

            const target = isAtTop ? container.querySelector('[data-card]:first-child') : container.querySelector('[data-card]:last-child')

            setFocusedItem(target?.id ?? null)
            return
        }

        // if (isAtTop || isAtBottom) {
        //     const ids = Array.from(visibleItems.keys())
        //     // console.log({ ids })

        //     if (ids.length === 0) {
        //         setFocusedItem(null)
        //         return
        //     }
        //     const targetId = isAtTop ? ids[0] : ids[ids.length - 1]

        //     setFocusedItem(targetId)
        //     return
        // }

        // Get all visible items with their ratios
        const visibleItemsList = Array.from(visibleItems.entries())

        // Sort by intersection ratio (highest first)
        visibleItemsList.sort((a, b) => b[1] - a[1])

        // If there's a clear winner (significantly higher ratio), use it
        const [topItemId, topRatio] = visibleItemsList[0]

        // If multiple items have similar ratios, prefer the one that's more centered
        if (visibleItemsList.length > 1) {
            const [secondItemId, secondRatio] = visibleItemsList[1]

            // If ratios are very close (within 10%), choose based on position
            if (Math.abs(topRatio - secondRatio) < 0.1) {
                // Get the container's scroll position and height
                const container = containerRef.current
                if (container) {
                    const containerRect = container.getBoundingClientRect()
                    const containerCenter = containerRect.top + containerRect.height / 2

                    // Find which item is closer to the center
                    const topItemElement = document.getElementById(topItemId)
                    const secondItemElement = document.getElementById(secondItemId)

                    if (topItemElement && secondItemElement) {
                        const topItemRect = topItemElement.getBoundingClientRect()
                        const secondItemRect = secondItemElement.getBoundingClientRect()

                        const topItemCenter = topItemRect.top + topItemRect.height / 2
                        const secondItemCenter = secondItemRect.top + secondItemRect.height / 2

                        const topDistance = Math.abs(containerCenter - topItemCenter)
                        const secondDistance = Math.abs(containerCenter - secondItemCenter)

                        if (secondDistance < topDistance) {
                            setFocusedItem(secondItemId)
                            return
                        }
                    }
                }
            }
        }

        // Only update if the focused item actually changed
        setFocusedItem(prev => (prev === topItemId ? prev : topItemId))
    }, [visibleItems, isMobile])

    return {
        visibleItems,
        focusedItem,
        containerRef,
    }
}
