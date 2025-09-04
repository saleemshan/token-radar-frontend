'use client'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import axios from 'axios'

const TermsOfService = () => {
    const [sanitizedContent, setSanitizedContent] = useState<string>('')

    useEffect(() => {
        const processMarkdown = async () => {
            const response = await axios.get('/documents/tos.md')
            const markdownContent = response.data

            if (markdownContent) {
                const sanitizedText = DOMPurify.sanitize(markdownContent)
                const markedContent = await marked(sanitizedText)
                setSanitizedContent(markedContent)
            }
        }

        processMarkdown()
    }, [])

    return (
        <>
            <Head>
                <title>Crush - Terms of Service</title>
            </Head>
            <div className="relative w-full rounded-lg md:border border-border overflow-hidden  flex-1 flex flex-col">
                <section className="relative z-20 flex flex-col flex-1 w-full px-3 md:px-6 mx-auto py-6 md:py-24 overflow-y-auto">
                    <div className="relative flex flex-col flex-1 w-full mx-auto text-neutral-text max-w-7xl">
                        <div className="pb-4 lg:pb-10 text-xl md:text-4xl font-montserrat font-bold">Terms of Service</div>

                        {sanitizedContent && (
                            <div
                                className="prose prose-neutral prose-invert !max-w-none prose-sm"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            />
                        )}
                    </div>
                </section>
            </div>
        </>
    )
}

export default TermsOfService
