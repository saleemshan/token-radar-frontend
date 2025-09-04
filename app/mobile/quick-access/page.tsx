'use client'
import UserXpBar from '@/components/UserXpBar'
import { useSettingsContext } from '@/context/SettingsContext'
import { useUser } from '@/context/UserContext'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import React from 'react'
import { FaCog, FaSignOutAlt } from 'react-icons/fa'
import { FaChartArea, FaChessKnight, FaNewspaper, FaUsers } from 'react-icons/fa6'
import { GiCardJoker } from 'react-icons/gi'
import { HiWallet } from 'react-icons/hi2'

const WalletPage = () => {
    usePreventZoomOnMobile()
    const { handleToggleSettingsModal } = useSettingsContext()
    const { handleLogout } = useUser()
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()

    if (ready && authenticated) {
        return (
            //  fixed inset-0
            <div className="flex-1 min-h-full max-w-full overflow-hidden  flex flex-col">
                <div className="flex flex-col gap-3 flex-1">
                    <div className="p-3  flex flex-col ">
                        <div className="w-full border border-border p-3 rounded-lg">
                            <UserXpBar />
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {process.env.NEXT_PUBLIC_ENABLE_NEWS_TRADING === 'true' && (
                            <Link
                                href={`/news-trading`}
                                className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                            >
                                <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                    <FaNewspaper className="text-xl" />
                                </div>
                                <span className="text-2xs">News Trading</span>
                            </Link>
                        )}

                        {process.env.NEXT_PUBLIC_ENABLE_PERPS === 'true' && (
                            <Link
                                href={`/mobile/perps/BTC?assetId=0`}
                                className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                            >
                                <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                    <FaChartArea className="text-xl" />
                                </div>
                                <span className="text-2xs">Perps</span>
                            </Link>
                        )}

                        <Link href={'/memecoins'} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <GiCardJoker className="text-xl" />
                            </div>
                            <span className="text-2xs">Memecoin</span>
                        </Link>
                        {process.env.NEXT_PUBLIC_ENABLE_ATS === 'true' && (
                            <Link href={`/ats`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                                <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                    <FaChessKnight className="text-xl" />
                                </div>
                                <span className="text-2xs">Strategies</span>
                            </Link>
                        )}
                        {process.env.NEXT_PUBLIC_ENABLE_REFERRAL === 'true' && (
                            <Link
                                href={`/referral`}
                                className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                            >
                                <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                    <FaUsers className="text-xl" />
                                </div>
                                <span className="text-2xs">Referral</span>
                            </Link>
                        )}

                        <Link
                            href={`/mobile/wallet`}
                            className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                        >
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <HiWallet className="text-xl" />
                            </div>
                            <span className="text-2xs">Wallet</span>
                        </Link>
                        {/* <Link href={`/mobile/search`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                        <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                            <FaSearch className="text-xl" />
                        </div>
                        <span className="text-2xs">Search</span>
                    </Link> */}
                        <button
                            type="button"
                            className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                            onClick={() => {
                                handleToggleSettingsModal()
                            }}
                        >
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <FaCog className="text-xl" />
                            </div>
                            <span className="text-2xs">Settings</span>
                        </button>
                        <button
                            type="button"
                            className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                            onClick={handleLogout}
                        >
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <FaSignOutAlt className="text-xl" />
                            </div>
                            <span className="text-2xs">Logout</span>
                        </button>
                    </div>

                    {/* <div className="p-3  border-t border-border">
                        <Button onClick={handleLogout} className="text-xs flex-1 min-h-full w-full ">
                            Logout
                        </Button>
                    </div> */}
                </div>
            </div>
        )
    } else {
        return (
            <div className="flex-1 min-h-full max-w-full overflow-hidden  flex flex-col items-center justify-center gap-3">
                <div>Sign in to view your wallet</div>
                <button type="button" className="border-b border-white" onClick={handleSignIn}>
                    Sign In
                </button>
            </div>
        )
    }
}

export default WalletPage
