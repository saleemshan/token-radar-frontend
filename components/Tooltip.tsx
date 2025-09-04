'use client'
import React, { useState, useRef, useLayoutEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface TooltipProps {
    text: string
    children: ReactNode
    className?: string
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
    const [visible, setVisible] = useState(false)
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({
        top: 0,
        left: 0,
    })
    const containerRef = useRef<HTMLDivElement | null>(null)
    const tooltipRef = useRef<HTMLDivElement | null>(null)

    const toggleTooltip = () => {
        setVisible(prev => !prev)
    }

    useLayoutEffect(() => {
        if (visible && containerRef.current && tooltipRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect()
            const tooltipRect = tooltipRef.current.getBoundingClientRect()
            const spaceAbove = containerRect.top
            // const spaceBelow = window.innerHeight - containerRect.bottom;

            let top: number
            let left = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2 + window.scrollX

            // Determine tooltip vertical position with sufficient space
            if (spaceAbove > tooltipRect.height + 8) {
                top = containerRect.top - tooltipRect.height - 8 + window.scrollY
            } else {
                top = containerRect.bottom + 8 + window.scrollY
            }

            // Ensure the tooltip doesn't overflow horizontally
            left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8))

            setTooltipPos({ top, left })
        }
    }, [visible])

    return (
        <div
            onMouseEnter={toggleTooltip}
            onMouseLeave={() => setVisible(false)}
            onTouchStart={toggleTooltip} // Handle touch interactions
            ref={containerRef}
            className="relative"
        >
            {children}
            {visible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        className={clsx(
                            'max-w-[11rem] px-2 py-1 rounded-md break-words overflow-hidden bg-black border border-border text-neutral-text text-[10px] absolute z-[5001] pointer-events-auto leading-tight cursor-pointer',
                            className
                        )}
                        style={{ top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
                    >
                        {text}
                    </div>,
                    document.body
                )}
        </div>
    )
}

export default Tooltip
