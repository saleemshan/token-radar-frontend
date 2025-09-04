import { getReadableNumber } from '@/utils/price'
import React from 'react'

const NewsItemPercentageChange = ({
    percentage,
    style = false,
    size = 'normal',
    padding = 'py-1',
    width = 'min-w-16 max-w-16',
    multiplyByHundred = true,
    decimals = 1,
}: {
    percentage: number
    style?: boolean
    size?: 'normal' | 'small' | 'extrasmall'
    padding?: string
    width?: string
    multiplyByHundred?: boolean
    decimals?: number
}) => {
    const getTextColor = (percentage: number) => {
        if (percentage > 0) {
            return 'text-positive'
        } else if (percentage < 0) {
            return 'text-negative'
        } else {
            return 'text-neutral-text'
        }
    }

    const getBackgroundColor = (percentage: number) => {
        if (percentage > 0) {
            return 'bg-positive/10'
        } else if (percentage < 0) {
            return 'bg-negative/10'
        } else {
            return 'bg-neutral-900/10'
        }
    }

    return (
        <div className="flex items-center justify-center">
            <div className={`rounded-lg   flex items-center justify-center ${padding} ${style ? getBackgroundColor(percentage) : ''}`}>
                <div
                    className={` text-ellipsis ${width} overflow-hidden text-center ${size === 'small' ? 'text-xs' : ''} ${
                        size === 'normal' ? 'text-sm' : ''
                    } ${size === 'extrasmall' ? 'text-[10px]' : ''} ${getTextColor(percentage)}`}
                >
                    {percentage * (multiplyByHundred ? 100 : 1) !== 0
                        ? `${getReadableNumber(percentage * (multiplyByHundred ? 100 : 1), decimals)}%`
                        : '-'}
                </div>
            </div>
        </div>
    )
}

export default NewsItemPercentageChange
