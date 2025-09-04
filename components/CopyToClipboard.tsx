'use client'
import useHaptic from '@/hooks/useHaptic'
import React, { useState } from 'react'
import { FaCheck, FaCopy } from 'react-icons/fa6'
import { toast } from 'react-toastify'

const CopyToClipboard = ({
    content,
    className = 'text-neutral-text-dark',
    message = 'Successfully copied to clipboard',
    iconSize = 10,
}: {
    content: string
    className?: string
    iconSize?: number
    message?: string
}) => {
    const [copyClicked, setCopyClicked] = useState(false)
    const { triggerHaptic } = useHaptic()
    return (
        <button
            type="button"
            className={`pointer-events-auto pl-1 ${className}`}
            onClick={event => {
                event.stopPropagation()
                triggerHaptic(50)

                navigator.clipboard.writeText(content)
                toast.success(message)
                setCopyClicked(true)
                setTimeout(() => {
                    setCopyClicked(false)
                }, 3000)
            }}
        >
            {copyClicked ? <FaCheck style={{ fontSize: `${iconSize}px` }} /> : <FaCopy style={{ fontSize: `${iconSize}px` }} />}
        </button>
    )
}

export default CopyToClipboard
