'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { FaGlobe, FaLink } from 'react-icons/fa6'
import Spinner from './Spinner'
import Portal from '@/portal/ModalPortal'
import Image from 'next/image'
import useIsMobile from '@/hooks/useIsMobile'

interface LinkMetadata {
    title: string
    description: string
    image?: string
    siteName?: string
    favicon?: string
}

export interface NewsItemPreviewLinkProps {
    url: string
    label: string
    mode?: 'metadata' | 'iframe'
    iframeHeight?: number
}

export function NewsItemPreviewLink({ url, label, mode = 'metadata', iframeHeight = 200 }: NewsItemPreviewLinkProps) {
    const isMobile = useIsMobile()
    const [isVisible, setIsVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
    const [error, setError] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const linkRef = useRef<HTMLAnchorElement>(null)
    const hoverTimeoutRef = useRef<NodeJS.Timeout>()
    const hideTimeoutRef = useRef<NodeJS.Timeout>()
    const cacheRef = useRef<Map<string, LinkMetadata>>(new Map())

    // Simulated metadata fetch (replace with your API)
    const fetchMetadata = async (link: string): Promise<LinkMetadata> => {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(link)}`)
        if (!res.ok) throw new Error('Failed to fetch metadata')
        return res.json()
    }

    const calculatePosition = () => {
        if (!linkRef.current) return { x: 0, y: 0 }

        const rect = linkRef.current.getBoundingClientRect()
        const vw = window.innerWidth
        const vh = window.innerHeight
        const w = 280
        const h = mode === 'iframe' ? iframeHeight : 200

        let x = rect.right + 12
        let y = rect.top

        if (x + w > vw - 16) x = rect.left - w - 12
        if (x < 16) x = Math.max(16, (vw - w) / 2)
        if (y + h > vh - 16) y = vh - h - 16
        if (y < 16) y = 16

        return { x, y }
    }

    const handleMouseEnter = () => {
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)

        hoverTimeoutRef.current = setTimeout(async () => {
            setPosition(calculatePosition())
            setIsVisible(true)

            if (mode === 'metadata') {
                if (cacheRef.current.has(url)) {
                    setMetadata(cacheRef.current.get(url) || null)
                    setError(false)
                    return
                }

                setIsLoading(true)
                setError(false)

                try {
                    const data = await fetchMetadata(url)
                    cacheRef.current.set(url, data)
                    setMetadata(data)
                } catch {
                    setError(true)
                } finally {
                    setIsLoading(false)
                }
            }
        }, 250)
    }

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
        hideTimeoutRef.current = setTimeout(() => setIsVisible(false), 120)
    }

    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
            if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
        }
    }, [])

    return (
        <>
            <Link
                href={url}
                target="_blank"
                ref={linkRef}
                className="max-w-full hover:underline overflow-hidden text-left flex items-center gap-1 hover:text-neutral-text apply-transition focus:outline-none"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <span>{label}</span>
            </Link>

            {isVisible && !isMobile && (
                <Portal targetId="modal-portal">
                    <>
                        <Link
                            href={url}
                            target="_blank"
                            className="fixed z-50 bg-black text-neutral-text rounded-lg border border-border shadow-2xl transition-all duration-200 ease-out overflow-hidden"
                            style={{ left: position.x, top: position.y, width: 280, maxHeight: mode === 'iframe' ? iframeHeight : 'auto' }}
                            onMouseEnter={() => {
                                if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
                            }}
                            onMouseLeave={handleMouseLeave}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-2 border-b border-border">
                                <span className="text-xs font-medium truncate">{new URL(url).hostname}</span>
                                <FaLink className="w-3 h-3  flex-shrink-0" />
                            </div>

                            {/* Content */}
                            {mode === 'iframe' ? (
                                <iframe
                                    src={url}
                                    title={label}
                                    className="w-full"
                                    style={{ height: iframeHeight - 32 }} // minus header
                                    sandbox="allow-same-origin allow-scripts allow-popups"
                                />
                            ) : isLoading ? (
                                <div className="flex items-center justify-center py-6 gap-2">
                                    <Spinner />
                                    <span className="text-xs">Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-6 gap-2 text-center">
                                    <FaGlobe className="w-3 h-3" />
                                    <p className="text-xs ">Unable to load metadata</p>
                                </div>
                            ) : metadata ? (
                                <div className="p-2 space-y-1 min-h-fit flex flex-col">
                                    {metadata.image && (
                                        <Image
                                            src={metadata.image}
                                            alt={metadata.title || 'Preview image'}
                                            height={120}
                                            width={300}
                                            className="object-cover rounded-md border border-border w-full h-20 select-none"
                                        />
                                    )}

                                    <h4 className="font-semibold  text-xs mb-1 line-clamp-2 leading-tight">{metadata.title}</h4>

                                    <p className="text-2xs text-neutral-text-dark leading-relaxed pr-1 line-clamp-3">{metadata.description}</p>
                                </div>
                            ) : null}
                        </Link>

                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black bg-opacity-5 backdrop-blur-[1px] z-40 pointer-events-none" />
                    </>
                </Portal>
            )}
        </>
    )
}
