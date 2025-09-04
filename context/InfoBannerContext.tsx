'use client'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { FaXmark } from 'react-icons/fa6'
import { socials } from '@/data/socials'

interface InfoBannerContextType {}

interface Banner {
    id: string
    header: string
    content: string
}

const InfoBannerContext = createContext<InfoBannerContextType | undefined>(undefined)

export const InfoBannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showBanner, setShowBanner] = useState(false)

    const [sanitizedContent, setSanitizedContent] = useState<string>('')

    const [banner, setBanner] = useState<undefined | Banner>(undefined)

    const handleCloseInfoBanner = () => {
        setShowBanner(false)

        if (banner) {
            localStorage.setItem(
                'crushInfoBanner',
                JSON.stringify({
                    show: false,
                    bannerId: banner.id,
                })
            )
        }
    }

    const getCrushInfoBanner = () => {
        setBanner({
            id: '1',
            header: 'Crush Early Access',
            content: `Join Crush Discord for early access [Click Here](${socials.discord})`, //markdown
        })
    }

    useEffect(() => {
        getCrushInfoBanner()
    }, [])

    useEffect(() => {
        const sanitizeMarkdown = async () => {
            if (banner && banner.content) {
                const sanitizedText = DOMPurify.sanitize(banner.content)
                const markedContent = await marked(sanitizedText)
                setSanitizedContent(markedContent)

                const storedBanner = localStorage.getItem('crushInfoBanner')
                const parsedBanner = JSON.parse(storedBanner ?? '{}')

                if (
                    parsedBanner &&
                    'bannerId' in parsedBanner &&
                    'show' in parsedBanner &&
                    parsedBanner.bannerId === banner.id &&
                    parsedBanner.show === false
                ) {
                    setShowBanner(false)
                } else {
                    setShowBanner(true)
                }
            }
        }

        if (banner) {
            sanitizeMarkdown()
        }
    }, [banner])

    return (
        <InfoBannerContext.Provider value={{}}>
            {children}

            {showBanner && banner && sanitizedContent && (
                <div className="fixed inset-0 pointer-events-none z-[100]">
                    <div className="absolute   bottom-3 left-3 ">
                        <div className="relative max-w-80 w-full ">
                            <div className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-white/30 via-white/60 to-white/30 opacity-75 blur-sm"></div>
                            <div className="flex flex-col w-full divide-y divide-border bg-black pointer-events-auto border border-border relative rounded-lg">
                                <div className="p-3 flex items-center justify-between  ">
                                    <div className="font-semibold">{banner.header}</div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={handleCloseInfoBanner}
                                            className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg w-6 h-6 items-center justify-center text-neutral-text apply-transition "
                                        >
                                            <FaXmark className="text-2xs" />
                                        </button>
                                    </div>
                                </div>

                                <div
                                    className="prose prose-neutral prose-invert !max-w-none prose-sm p-3"
                                    dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </InfoBannerContext.Provider>
    )
}

export const useInfoBanner = () => {
    const context = useContext(InfoBannerContext)
    if (context === undefined) {
        throw new Error('useInfoBanner must be used within a InfoBannerProvider')
    }
    return context
}
