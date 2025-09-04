'use client'
import MobileAddToHomeScreenPrompt from '@/components/mobile/MobileAddToHomeScreenPrompt'
import MobileHome from '@/components/mobile/MobileMemecoins'
import HyperliquidTokensPanel from '@/components/panel/HyperliquidTokensPanel'
import useIsMobile from '@/hooks/useIsMobile'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import { redirect } from 'next/navigation'

export default function Perps() {
    usePreventZoomOnMobile()
    const isMobile = useIsMobile()

    if (true) {
        redirect('/perps/BTC?assetId=0')
    }

    return (
        <>
            {/* Desktop Home */}
            {!isMobile && (
                <div className=" max-h-full overflow-hidden w-full flex-1 md:block hidden ">
                    <HyperliquidTokensPanel
                        columns={[
                            'token',
                            'created',
                            'price',
                            'liq',
                            'mcap',
                            'holders',
                            'txs',
                            'volume24h',
                            'priceChange1h',
                            'priceChange24h',
                            'quickBuy',
                        ]}
                        border={false}
                        rounded={false}
                    />
                </div>
            )}

            {/* Mobile Home */}
            <MobileHome />
            <MobileAddToHomeScreenPrompt />
        </>
    )
}
