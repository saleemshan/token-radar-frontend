import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getReadableNumber } from '@/utils/price'
import Image from 'next/image'
import React from 'react'

const TokenPriceLabel = ({ ticker, price }: { ticker: string; price: number | undefined }) => {
    const getTickerImage = () => {
        if (ticker === 'btc') {
            return `/images/ticker/btc.png`
        }
        if (ticker === 'eth') {
            return `/images/ticker/eth.png`
        }
        if (ticker === 'sol') {
            return `/images/ticker/sol.png`
        }

        return TOKEN_PLACEHOLDER_IMAGE
    }

    return (
        <div className="flex items-center gap-1 border border-border rounded-full py-[2px] px-[5px]">
            <div className="min-w-3 min-h-3 max-w-3 max-h-3 relative flex items-center justify-center gap-2">
                <Image src={`${getTickerImage()}`} alt={`${ticker} logo`} width={100} height={100} className="" />
            </div>
            <div className="text-2xs">{price ? getReadableNumber(price, 2, '$') : '-'}</div>
        </div>
    )
}

export default TokenPriceLabel
