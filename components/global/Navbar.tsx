/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import PrimaryButton from '@/components/PrimaryButton'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { FaDiscord, FaMedium, FaRobot, FaWallet, FaXTwitter } from 'react-icons/fa6'

import { useUser } from '../../context/UserContext'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'

import useUserPublicWalletAddressData from '@/hooks/data/useUserPublicWalletAddressData'
import WalletPanel from '../panel/WalletPanel'
import { usePathname, useSearchParams } from 'next/navigation'
// import useUserTokenHoldingsData from '@/hooks/data/useUserTokenHoldingsData'
// import useUserTokenHoldingsAnalyticData from '@/hooks/data/useUserHoldingsAnalyticData'
// import useUserBalancesActivitiesData from '@/hooks/data/useUserBalancesActivitiesData'

import { FaCog, FaTelegramPlane } from 'react-icons/fa'
import axiosLib from '@/lib/axios'
import { useSettingsContext } from '@/context/SettingsContext'
import useIsMobile from '@/hooks/useIsMobile'
import { IoMdMenu } from 'react-icons/io'
import { socials } from '@/data/socials'
import SearchTokenForm from '../forms/SearchTokenForm'
import Button from '../ui/Button'
import HyperliquidExchangeModal, { HyperliquidExchangeModalMethods } from '../modal/HyperliquidExchangeModal'
import StrategiesPanel from '../panel/StrategiesPanel'
import useHaptic from '@/hooks/useHaptic'
// import { useHyperLiquidContext } from '@/context/hyperLiquidContext'

const Navbar = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { toggleAIAssistant } = useUser()
    const depositModalRef = useRef<HyperliquidExchangeModalMethods>(null)
    const { handleOpenSettingsModal } = useSettingsContext()
    const { triggerHaptic } = useHaptic()

    const { logout: handleSignOut } = useLogout({
        onSuccess: async () => {
            localStorage.removeItem('newsTradingFeed')
            const event = new Event('clearNewsTradingFeed')
            window.dispatchEvent(event)
        },
    })
    const { login: handleSignIn } = useLogin({
        onComplete: async ({ user }) => {
            const referrerCode = searchParams.get('ref')
            try {
                //check if user exists in referral system
                const { data: userExists } = await axiosLib.get('/api/user/referral')
                if (userExists) {
                    await axiosLib.post('/api/user', {
                        referrerCode,
                        user,
                    })
                }
            } catch (error) {
                console.log(error)
            }
        },
        onError: error => {
            console.log(error)
        },
    })
    const { ready, authenticated } = usePrivy()
    const isMobile = useIsMobile()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setUserPublicWalletAddresses, userPublicWalletAddresses, setIsEthWalletAddressFetched } = useUser()
    const { data: userPublicEthWalletAddressData, isFetched: isEthWalletAddressFetched } = useUserPublicWalletAddressData('ethereum')
    const { data: userPublicSolWalletAddressData } = useUserPublicWalletAddressData('solana')

    // //Preload wallet token holding
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userSolanaTokenHoldings } = useUserTokenHoldingsData('solana', userPublicWalletAddresses['solana'])

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userEthereumTokenHoldings } = useUserTokenHoldingsData('ethereum', userPublicWalletAddresses['ethereum'])

    // //Preload wallet analytics
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userSolanaHoldingsAnalytic } = useUserTokenHoldingsAnalyticData('solana', userPublicWalletAddresses['solana'])
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userEthereumHoldingsAnalytic } = useUserTokenHoldingsAnalyticData('ethereum', userPublicWalletAddresses['ethereum'])

    // //Preload activities
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userSolanaBalancesActivitiesData } = useUserBalancesActivitiesData('solana')

    // // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const { data: userEthereumBalancesActivitiesData } = useUserBalancesActivitiesData('ethereum')

    const [showNavigation, setShowNavigation] = useState(false)
    const [showWalletPanel, setShowWalletPanel] = useState(false)
    const [showStrategyPanel, setShowStrategyPanel] = useState(false)

    const handleLinkClick = () => {
        if (isMobile) setShowNavigation(false)
        setShowWalletPanel(false)
        setShowStrategyPanel(false)
    }

    const handleOpenDepositModal = () => {
        depositModalRef.current?.toggleModal()
    }

    useEffect(() => {
        if (isMobile) {
            setShowNavigation(false)
        } else {
            setShowNavigation(true)
        }
    }, [isMobile])

    useEffect(() => {
        if (userPublicSolWalletAddressData) {
            setUserPublicWalletAddresses('solana', userPublicSolWalletAddressData)
        }
        if (userPublicEthWalletAddressData) {
            setUserPublicWalletAddresses('ethereum', userPublicEthWalletAddressData)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userPublicSolWalletAddressData, userPublicEthWalletAddressData])

    useEffect(() => {
        setIsEthWalletAddressFetched(isEthWalletAddressFetched)
    }, [isEthWalletAddressFetched, setIsEthWalletAddressFetched])

    return (
        <>
            <nav className="flex items-center justify-between p-3 max-h-16 min-h-16 w-full gap-3 text-sm border-b border-border bg-black">
                <div className="flex items-center gap-4 min-w-fit text-neutral-text-dark text-xs">
                    <Link onClick={handleLinkClick} href={`/`}>
                        <Image
                            src={`${process.env.basePath}/images/brand/logo-wordmark.png`}
                            alt="Crush Logo"
                            width={70}
                            height={20}
                            className="hidden md:block mr-2 min-w-fit"
                        />
                        <div className=" w-9 h-9 min-w-9 min-h-9 p-[6px] bg-table-odd border border-border overflow-hidden rounded-lg flex md:hidden items-center justify-center">
                            <Image
                                src={`${process.env.basePath}/images/brand/logo.svg`}
                                alt="Crush Logo"
                                width={50}
                                height={50}
                                className="object-contain w-full h-full"
                            />
                        </div>
                    </Link>

                    {showNavigation && (
                        <div
                            onClick={e => {
                                if (e.target === e.currentTarget) {
                                    // handle click
                                    setShowNavigation(false)
                                }
                            }}
                            className="fixed md:relative inset-0  gap-3 z-[103] bg-black/30 left-0"
                        >
                            <div className="flex flex-col text-sm md:text-sm bg-black min-h-screen md:min-h-fit   md:items-center  w-1/2 md:w-full border-r border-border md:border-r-0">
                                <div className="flex flex-col md:flex-row w-full p-3 pb-0 md:p-0 gap-3">
                                    <div className=" w-9 h-9 min-w-9 min-h-9 p-[6px] mt-[2px] bg-table-odd border border-border overflow-hidden rounded-lg flex md:hidden items-center justify-center mb-2">
                                        <Image
                                            src={`${process.env.basePath}/images/brand/logo.svg`}
                                            alt="Crush Logo"
                                            width={50}
                                            height={50}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>

                                    {process.env.NEXT_PUBLIC_ENABLE_NEWS_TRADING === 'true' && (
                                        <Link
                                            onClick={handleLinkClick}
                                            href={`/`}
                                            className={` whitespace-nowrap apply-transition ${
                                                pathname === '/' ? ' text-neutral-text' : ' hover:text-neutral-text/80'
                                            }`}
                                        >
                                            News Trading
                                        </Link>
                                    )}

                                    {process.env.NEXT_PUBLIC_ENABLE_MEMECOINS === 'true' && (
                                        <Link
                                            onClick={handleLinkClick}
                                            href="/memecoins"
                                            className={` whitespace-nowrap apply-transition block md:hidden ${
                                                pathname === '/memecoins' ? ' text-neutral-text' : ' hover:text-neutral-text/80'
                                            }`}
                                        >
                                            Memecoins
                                        </Link>
                                    )}

                                    {process.env.NEXT_PUBLIC_ENABLE_MEMECOINS === 'true' && (
                                        <div className="md:block hidden relative group">
                                            <button className="flex items-center  focus:outline-none">
                                                <span
                                                    className={` whitespace-nowrap apply-transition ${
                                                        pathname.includes('/memecoins') ? ' text-neutral-text' : ' hover:text-neutral-text/80'
                                                    }`}
                                                >
                                                    Memecoins
                                                </span>
                                            </button>

                                            <div className="absolute z-[500] left-0 mt-2 w-fit rounded-md shadow-lg bg-black border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-in-out">
                                                <div className="p-1 flex flex-col gap-1">
                                                    <Link
                                                        onClick={handleLinkClick}
                                                        href="/memecoins"
                                                        className={`block px-3 py-2 text-xs group rounded-md  ${
                                                            pathname === '/memecoins' ? 'bg-table-odd' : 'hover:bg-table-odd'
                                                        }`}
                                                    >
                                                        <div
                                                            className={` whitespace-nowrap apply-transition ${
                                                                pathname === '/memecoins' ? ' text-neutral-text' : ' group-hover:text-neutral-text/80'
                                                            }`}
                                                        >
                                                            Trending
                                                        </div>
                                                        <p className="text-2xs text-neutral-text-dark whitespace-nowrap">
                                                            Popular and trending trading pairs
                                                        </p>
                                                    </Link>
                                                    <Link
                                                        onClick={handleLinkClick}
                                                        href="/memecoins/new-pairs"
                                                        className={`block px-3 py-2 group text-xs rounded-md   ${
                                                            pathname === '/memecoins/new-pairs' ? 'bg-table-odd' : 'hover:bg-table-odd'
                                                        }`}
                                                    >
                                                        <div
                                                            className={` whitespace-nowrap apply-transition ${
                                                                pathname === '/memecoins/new-pairs'
                                                                    ? ' text-neutral-text'
                                                                    : ' group-hover:text-neutral-text/80'
                                                            }`}
                                                        >
                                                            New Pairs
                                                        </div>
                                                        <p className="text-2xs text-neutral-text-dark whitespace-nowrap">
                                                            Recently listed trading pairs
                                                        </p>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {process.env.NEXT_PUBLIC_ENABLE_PERPS === 'true' && (
                                        <Link
                                            onClick={handleLinkClick}
                                            href={`${isMobile ? '/mobile/perps/BTC?assetId=0' : '/perps/BTC?assetId=0'}`}
                                            className={` whitespace-nowrap apply-transition  ${
                                                pathname.includes('/perps') ? 'text-neutral-text' : ' hover:text-neutral-text/80'
                                            }`}
                                        >
                                            Perps
                                        </Link>
                                    )}

                                    {process.env.NEXT_PUBLIC_ENABLE_REFERRAL === 'true' && (
                                        <>
                                            {ready && authenticated ? (
                                                <Link
                                                    onClick={handleLinkClick}
                                                    href={`/points`}
                                                    className={` whitespace-nowrap apply-transition  ${
                                                        pathname === '/points' ? 'text-neutral-text' : ' hover:text-neutral-text/80'
                                                    }`}
                                                >
                                                    Points
                                                </Link>
                                            ) : (
                                                <button type="button" onClick={handleSignIn} className="text-left">
                                                    Points
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {/* {process.env.NEXT_PUBLIC_ENABLE_ATS === 'true' && isMobile && (
                                        <>
                                            {ready && authenticated ? (
                                                <Link
                                                    onClick={handleLinkClick}
                                                    href={`/ats`}
                                                    className={` whitespace-nowrap apply-transition  ${
                                                        pathname === '/ats' ? 'text-neutral-text' : ' hover:text-neutral-text/80'
                                                    }`}
                                                >
                                                    Strategies
                                                </Link>
                                            ) : (
                                                <button type="button" onClick={handleSignIn} className="text-left">
                                                    Strategies
                                                </button>
                                            )}
                                        </>
                                    )} */}

                                    <Link
                                        onClick={handleLinkClick}
                                        href="/terms-of-service"
                                        className={` whitespace-nowrap apply-transition block md:hidden ${
                                            pathname === '/terms-of-service' ? ' text-neutral-text' : ' hover:text-neutral-text/80'
                                        }`}
                                    >
                                        Terms of Service
                                    </Link>
                                    <Link
                                        onClick={handleLinkClick}
                                        href="/privacy-policy"
                                        className={` whitespace-nowrap apply-transition block md:hidden ${
                                            pathname === '/privacy-policy' ? ' text-neutral-text' : ' hover:text-neutral-text/80'
                                        }`}
                                    >
                                        Privacy Policy
                                    </Link>
                                </div>

                                <div className=" flex md:hidden mb-4  w-full  mt-auto ">
                                    <Link
                                        href={socials.discord}
                                        target="_blank"
                                        className=" text-neutral-text apply-transition p-3 flex items-center justify-center w-full"
                                    >
                                        <FaDiscord />
                                    </Link>
                                    <Link
                                        href={socials.medium}
                                        target="_blank"
                                        className=" text-neutral-text apply-transition p-3 flex items-center justify-center w-full"
                                    >
                                        <FaMedium />
                                    </Link>

                                    <Link
                                        href={socials.x}
                                        target="_blank"
                                        className=" text-neutral-text apply-transition p-3 flex items-center justify-center w-full"
                                    >
                                        <FaXTwitter />
                                    </Link>

                                    <Link
                                        href={socials.telegramBot.main}
                                        target="_blank"
                                        className=" text-neutral-text apply-transition p-3 flex items-center justify-center w-full"
                                    >
                                        <FaTelegramPlane />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2  flex-1 justify-end ">
                    {/* <ChainButton /> */}

                    {!isMobile && pathname.includes('/memecoins') && <SearchTokenForm />}

                    {ready && authenticated && (
                        <Button
                            variant="neutral"
                            onClick={() => {
                                handleOpenDepositModal()
                                triggerHaptic(20)
                            }}
                            className="text-xs"
                            padding="px-4"
                            height="h-9 min-h-9"
                        >
                            Deposit
                        </Button>
                    )}

                    {process.env.NEXT_PUBLIC_ENABLE_AI_COMPANION === 'true' && (
                        <button
                            type="button"
                            className={`flex bg-table-odd border border-border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text `}
                            onClick={() => {
                                toggleAIAssistant()
                            }}
                        >
                            <FaRobot className="text-base" />
                        </button>
                    )}

                    {ready && authenticated ? (
                        <>
                            {process.env.NEXT_PUBLIC_ENABLE_ATS === 'true' && (
                                <button
                                    id="strategy-button"
                                    type="button"
                                    onClick={() => {
                                        triggerHaptic(20)
                                        if (showWalletPanel) {
                                            setShowWalletPanel(false)
                                        }
                                        setShowStrategyPanel(!showStrategyPanel)
                                    }}
                                    className={`flex bg-table-odd border border-border rounded-lg px-2 lg:px-4 gap-2  h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition   text-neutral-text `}
                                >
                                    <span className="hidden lg:block uppercase text-xs">Strategies</span>
                                    <FaRobot className="lg:hidden block text-lg" />
                                </button>
                            )}

                            <button
                                id="wallet-button"
                                type="button"
                                onClick={() => {
                                    triggerHaptic(20)
                                    if (showStrategyPanel) {
                                        setShowStrategyPanel(false)
                                    }
                                    setShowWalletPanel(!showWalletPanel)
                                }}
                                className={`flex bg-table-odd border border-border rounded-lg px-2 gap-2 w-9 min-w-9 h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition   text-neutral-text `}
                            >
                                <FaWallet className="text-sm" />
                            </button>

                            <button
                                id="mobile-pwa-notifications"
                                type="button"
                                className={`flex  bg-table-odd border border-border rounded-lg px-2 gap-2 w-9 min-w-9 h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text  `}
                                onClick={() => {
                                    triggerHaptic(20)
                                    handleOpenSettingsModal()
                                }}
                            >
                                <FaCog className="text-base" />
                            </button>
                        </>
                    ) : (
                        <PrimaryButton
                            className="block"
                            onClick={() => {
                                triggerHaptic(20)
                                authenticated ? handleSignOut() : handleSignIn()
                            }}
                        >
                            Sign In
                        </PrimaryButton>
                    )}
                    <button
                        type="button"
                        className={`flex md:hidden  bg-table-odd border border-border rounded-lg px-2 gap-2 w-9 min-w-9 h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text  `}
                        onClick={() => {
                            triggerHaptic(20)
                            setShowNavigation(true)
                        }}
                    >
                        <IoMdMenu className="text-xl" />
                    </button>
                </div>

                {showWalletPanel && <WalletPanel setShowWalletPanel={setShowWalletPanel} />}
                {showStrategyPanel && <StrategiesPanel setShowStrategyPanel={setShowStrategyPanel} />}
            </nav>

            <HyperliquidExchangeModal ref={depositModalRef} />
        </>
    )
}

export default Navbar
