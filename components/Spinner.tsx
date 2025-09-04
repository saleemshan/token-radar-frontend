import clsx from 'clsx'
import React from 'react'

const Spinner = ({
    size = 12,
    borderWidth = 2.5,
    className = '',
    variant = 'neutral',
}: {
    size?: number
    borderWidth?: number
    className?: string
    variant?: 'neutral' | 'primary' | 'positive' | 'negative'
}) => {
    let color

    switch (variant) {
        case 'neutral':
            color = 'text-neutral-text-dark'
            break
        case 'primary':
            color = 'text-neutral-800'
            break
        case 'positive':
            color = 'text-positive'
            break
        case 'negative':
            color = 'text-negative'
            break
        default:
            color = 'text-neutral-text-dark'
            break
    }

    return (
        <div className={`${clsx(color, className)} flex items-center justify-center`}>
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderWidth: `${borderWidth}px`,
                }}
                className={`inline-block animate-spin rounded-full  border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                role="status"
            ></div>
        </div>
    )
}

export default Spinner
