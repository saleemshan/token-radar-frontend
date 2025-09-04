import React from 'react'

export type TagVariant = 'positive' | 'negative' | 'neutral' | 'info' | 'success' | 'failed' | 'ghost' | 'crypto' | 'tradfi' | 'social'

const Tag = ({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: TagVariant }) => {
    let colorClass: string = ''

    switch (variant.toLowerCase()) {
        case 'neutral':
            colorClass = 'border-neutral-800 text-neutral-text bg-neutral-900 '
            // colorClass = 'border-border text-neutral-text bg-table-odd ';
            break
        case 'ghost':
            colorClass = 'border-transparent text-neutral-text-dark bg-transparent'
            // colorClass = 'border-border text-neutral-text bg-table-odd ';
            break
        case 'positive':
        case 'success':
            colorClass = 'border-positive text-positive bg-positive/10 '
            break
        case 'negative':
        case 'failed':
            colorClass = 'border-negative text-negative bg-negative/10 '
            break
        case 'crypto':
            colorClass = 'border-neutral-800 text-orange-500 bg-neutral-900' // Bitcoin-inspired
            break
        case 'tradfi':
            colorClass = 'border-neutral-800 text-emerald-600 bg-neutral-900' // Money/finance vibe
            break
        case 'social':
            colorClass = 'border-neutral-800 text-sky-500 bg-neutral-900' // Twitter blue
            break

        default:
            colorClass = 'border-border text-neutral-text bg-table-odd '
            break
    }

    return <div className={`text-2xs leading-none border rounded-full  py-[3px] px-2 ${colorClass}`}>{children}</div>
}

export default Tag
