'use client'

import HyperLiquidTradeForm from '@/components/Hyperliquid/HyperLiquidTradeForm'

import { useMemo, useRef } from 'react'

import OrderBookAndTrades from '@/components/Hyperliquid/OrderBookAndTrades'
import { usePairTokensContext } from '@/context/pairTokensContext'

import PortfolioStatusCard from '@/components/Hyperliquid/PortfolioStatusCard'

import TradeTokenTabsWrapper from '@/components/Hyperliquid/TradeTokenTabsWrapper'
import HyperliquidChart from '@/components/graph/HyperliquidChart'
import Image from 'next/image'
import TokenKeyDetails from '@/components/Hyperliquid/TokenKeyDetails'
// import HyperLiquidTransactionActions from '@/components/Hyperliquid/HyperLiquidTransactionActions'
// import { usePrivy } from '@privy-io/react-auth'
const TradePage = () => {
    // const { ready, authenticated } = usePrivy()
    const { isSpotToken, tokenId, spotTokenId } = usePairTokensContext()

    const middleContainer = useRef<HTMLDivElement | null>(null)

    const tokenName = useMemo(() => {
        if (isSpotToken) {
            return spotTokenId
        }
        return tokenId
    }, [isSpotToken, tokenId, spotTokenId])

    // useEffect(() => {
    //   console.log({ tokenName });
    // }, [tokenName]);

    if (tokenId)
        return (
            <>
                <div
                    ref={middleContainer}
                    className="max-h-full overflow-y-auto w-full flex-1 flex-col gap-3 no-scrollbar  border-r bg-black border-border  relative md:mb-0"
                >
                    <TokenKeyDetails showSelectTokenPairs={true} />
                    <div className=" min-h-[60vh] h-[60vh] md:min-h-[65vh] md:h-[65vh] border-b border-border bg-black flex flex-col w-full relative items-center justify-center">
                        <HyperliquidChart token={tokenName ?? ''} containerHeight="h-full" />
                        <div className="absolute pointer-events-none z-[10]">
                            <Image
                                src={`${process.env.basePath}/images/brand/logo-wordmark.png`}
                                style={{ opacity: 0.1 }}
                                alt="Crush Logo"
                                width={200}
                                height={50}
                            />
                        </div>
                    </div>
                    <TradeTokenTabsWrapper />
                </div>
                <div className="w-64 lg:w-72 overflow-hidden max-h-full hidden md:flex flex-col gap-3  pointer-events-auto ">
                    <OrderBookAndTrades />
                </div>
                <div className="hidden w-64 lg:w-80  md:flex flex-col overflow-hidden  pointer-events-none border-l border-border">
                    <div className="overflow-y-auto h-full flex flex-col pointer-events-auto no-scrollbar divide-y divide-border border-b border-border">
                        <HyperLiquidTradeForm />
                        <PortfolioStatusCard />
                    </div>
                    {/* {ready && authenticated && <HyperLiquidTransactionActions />} */}
                </div>
            </>
        )
}

export default TradePage
