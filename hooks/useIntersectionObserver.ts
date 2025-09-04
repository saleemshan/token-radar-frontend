'use client'

import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverProps {
    threshold?: number
    root?: Element | null
    rootMargin?: string
}

export const useIntersectionObserver = <T extends HTMLElement = HTMLElement>({
    threshold = 0,
    root = null,
    rootMargin = '0px',
    once = false,
}: UseIntersectionObserverProps & { once?: boolean } = {}) => {
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
    const elementRef = useRef<T | null>(null)

    useEffect(() => {
        const node = elementRef.current
        if (!node) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                setEntry(entry)
                if (once && entry.isIntersecting) {
                    observer.unobserve(node) // stop observing once visible
                }
            },
            { threshold, root, rootMargin }
        )

        observer.observe(node)

        return () => observer.disconnect()
    }, [threshold, root, rootMargin, once])

    return { elementRef, entry }
}
