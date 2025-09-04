'use client'

import { useHyperLiquidContext } from '@/context/hyperLiquidContext'

export const SlippageDisplay = () => {
    const { marketOrderSlippage } = useHyperLiquidContext()
    return <span>Max: {marketOrderSlippage.toFixed(2)}%</span>
}
