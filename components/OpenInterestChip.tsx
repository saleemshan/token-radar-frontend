import React from 'react'
import { getReadableNumber } from '@/utils/price'

interface OpenInterestChipProps {
    label: string
    value?: number
}

const OpenInterestChip = ({ label, value = 0 }: OpenInterestChipProps) => {
    return (
        <div className="flex items-center gap-1 border border-border rounded-full py-[2px] px-[5px]">
            <div className="text-2xs text-neutral-text-dark">{label}</div>
            <div className="text-2xs">{value ? getReadableNumber(value, 2, '$') : '$0.00'}</div>
        </div>
    )
}

export default OpenInterestChip
