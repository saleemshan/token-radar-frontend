'use client'
import { socials } from '@/data/socials'
import useIsMobile from '@/hooks/useIsMobile'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { FaTelegramPlane } from 'react-icons/fa'
import { FaDiscord, FaMedium, FaXTwitter } from 'react-icons/fa6'
import TradingViewStatusIndicator from '@/components/TradingViewStatusIndicator'
import TokenPriceLabel from '@/components/TokenPriceLabel'
import { useSettingsContext } from '@/context/SettingsContext'
import LiveClock from '../LiveClock'
import OpenInterestChip from '@/components/OpenInterestChip'
import useOpenInterestData from '@/hooks/data/useOpenInterestData'
import { usePairTokensContext } from '@/context/pairTokensContext'

const StatusBar = () => {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    const { timezone, handleToggleSettingsModal } = useSettingsContext()
    const { data: openInterestData, isLoading } = useOpenInterestData()
    const { btcTokenPrice, solTokenPrice, ethTokenPrice } = usePairTokensContext()

    if (!isMobile)
        return (
            <div className=" bg-black w-full border-t border-border text-xs  flex justify-between items-center h-8 min-h-8">
                <div className="flex items-center justify-center pl-1 gap-1">
                    {(pathname.includes('/tokens') || pathname === '/' || pathname.includes('/perps')) && <TradingViewStatusIndicator />}

                    <TokenPriceLabel price={btcTokenPrice} ticker={'btc'} />
                    <TokenPriceLabel price={ethTokenPrice} ticker={'eth'} />
                    <TokenPriceLabel price={solTokenPrice} ticker={'sol'} />
                </div>

                <div className="hidden lg:flex items-center gap-2">
                    {openInterestData && !isLoading && (
                        <>
                            <OpenInterestChip label="BTC OI" value={openInterestData.btcOI} />
                            <OpenInterestChip label="ETH OI" value={openInterestData.ethOI} />
                            <OpenInterestChip label="SOL OI" value={openInterestData.solOI} />
                            <OpenInterestChip label="Altcoin OI" value={openInterestData.altcoinOI} />
                        </>
                    )}
                </div>

                <div className="flex">
                    <div className="flex items-center gap-2 border-l border-border p-2 h-8 min-h-8 ">
                        <Link href="https://home.crush.xyz/" target="_blank" className=" text-neutral-text apply-transition text-2xs">
                            Crush
                        </Link>
                        <Link href="/terms-of-service" target="_blank" className=" text-neutral-text apply-transition text-2xs">
                            Terms of Service
                        </Link>
                        <Link href="/privacy-policy" target="_blank" className=" text-neutral-text apply-transition text-2xs">
                            Privacy Policy
                        </Link>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-l border-border p-2 h-8 min-h-8">
                        <Link href={socials.discord} target="_blank" className=" text-neutral-text apply-transition">
                            <FaDiscord />
                        </Link>
                        <Link href={socials.medium} target="_blank" className=" text-neutral-text apply-transition">
                            <FaMedium />
                        </Link>

                        <Link href={socials.x} target="_blank" className=" text-neutral-text apply-transition">
                            <FaXTwitter />
                        </Link>

                        <Link href={socials.telegramBot.main} target="_blank" className=" text-neutral-text apply-transition">
                            <FaTelegramPlane />
                        </Link>
                    </div>
                    <button
                        onClick={() => {
                            handleToggleSettingsModal('Timezone')
                        }}
                        className="p-2 flex gap-2 items-center text-2xs text-neutral-text-dark border-l border-border"
                    >
                        <LiveClock timezone={timezone} className="text-2xs text-neutral-text" />
                    </button>
                </div>
            </div>
        )
}

export default StatusBar
