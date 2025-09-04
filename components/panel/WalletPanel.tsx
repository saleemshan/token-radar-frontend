import { useUser } from '@/context/UserContext'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import React, { useEffect, useRef, useState } from 'react'
import { FaArrowsRotate, FaChevronDown, FaChevronRight } from 'react-icons/fa6'
import CopyToClipboard from '../CopyToClipboard'
import Image from 'next/image'
import Link from 'next/link'
import { getReadableNumber } from '@/utils/price'
import TextLoading from '../TextLoading'
import { formatDateForWalletActivity } from '@/utils/time'
import {
    calculateTokenHoldings,
    // combineProfitPercentages,
    filterWalletActivities,
    getActivityName,
    getActivitySymbol,
    getTextColor,
    mergeActivitiesByDate,
    sortActivities,
    sortUserTokenHoldings,
} from '@/utils/wallet'
// import WithdrawForm from '../forms/WithdrawForm'
import useIsMobile from '@/hooks/useIsMobile'
import useUserBalancesActivitiesData from '@/hooks/data/useUserBalancesActivitiesData'
import { getChainImage } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import { CRUSH_ETHEREUM_ADDRESS, getExplorerUrl, mainCurrencyChainAddresses, USDC_ETHEREUM_ADDRESS, USDC_SOLANA_ADDRESS } from '@/data/default/chains'
import useUserTokenHoldingsData from '@/hooks/data/useUserTokenHoldingsData'
import useArbitrumWalletHoldingsData from '@/hooks/data/useArbitrumWalletHoldingsData'
// import useUserTokenHoldingsAnalyticData from '@/hooks/data/useUserHoldingsAnalyticData'
// import PercentageChange from '../PercentageChange'
// import Tooltip from '../Tooltip'
import ImageFallback from '../ImageFallback'

import Button from '../ui/Button'
import { useSettingsContext } from '@/context/SettingsContext'
import HideSmallAssetsButton from '../HideSmallAssetsButton'
import UserXpBar from '../UserXpBar'
import { useWebDataContext } from '@/context/webDataContext'
import WithdrawModal, { WithdrawModalMethods } from '../modal/WithdrawModal'
import EmptyData from '../global/EmptyData'
import { getCapitalizeFirstLetter } from '@/utils/crypto'
import useUserTokenBalanceData from '@/hooks/data/useUserTokenBalance'
import { usePairTokensContext } from '@/context/pairTokensContext'
import XButton from '../ui/XButton'

const WalletPanel = ({ setShowWalletPanel }: { setShowWalletPanel: (show: boolean) => void }) => {
    const isMobile = useIsMobile()
    const { authenticated, ready } = usePrivy()

    const { userPublicWalletAddresses, handleLogout, setLastSelectedToken } = useUser()
    const { solTokenPrice, ethTokenPrice } = usePairTokensContext()

    const { login: handleSignIn } = useLogin()
    const [isBalanceLoading, setIsBalanceLoading] = useState(true)
    const [showDepositWalletAddresses, setShowDepositWalletAddresses] = useState(false)
    const { webData2 } = useWebDataContext()

    const withdrawModalRef = useRef<WithdrawModalMethods>(null)

    const handleOpenWithdrawModal = () => {
        withdrawModalRef.current?.toggleModal()
    }

    useEffect(() => {
        if (isMobile) {
            setShowDepositWalletAddresses(false)
        }
    }, [isMobile])

    const { hideSmallAssets } = useSettingsContext()
    const [filteredUserBalances, setFilteredUserBalances] = useState<UserTokenHoldings>([])

    //analytics
    // const {
    //     data: userSolanaHoldingsAnalytic,
    //     isRefetching: isUserSolanaHoldingsAnalyticRefetching,
    //     isFetched: isUserSolanaHoldingsAnalyticFetched,
    //     refetch: refetchSolanaHoldingsAnalytic,
    // } = useUserTokenHoldingsAnalyticData('solana', userPublicWalletAddresses['solana'])
    // const {
    //     data: userEthereumHoldingsAnalytic,
    //     isRefetching: isUserEthereumHoldingsAnalyticRefetching,
    //     isFetched: isUserEthereumHoldingsAnalyticFetched,
    //     refetch: refetchEthereumHoldingsAnalytic,
    // } = useUserTokenHoldingsAnalyticData('ethereum', userPublicWalletAddresses['ethereum'])

    // const [holdingsPercentageChange, setHoldingsPercentageChange] = useState<number | undefined>(0)

    // useEffect(() => {
    //     if (isUserEthereumHoldingsAnalyticRefetching || isUserSolanaHoldingsAnalyticRefetching) {
    //         setHoldingsPercentageChange(undefined)
    //     }

    //     if (
    //         userSolanaHoldingsAnalytic &&
    //         userEthereumHoldingsAnalytic &&
    //         !isUserEthereumHoldingsAnalyticRefetching &&
    //         !isUserSolanaHoldingsAnalyticRefetching
    //     ) {
    //         // console.log({ userSolanaHoldingsAnalytic, userEthereumHoldingsAnalytic })

    //         const percentageChange = combineProfitPercentages([userSolanaHoldingsAnalytic, userEthereumHoldingsAnalytic])

    //         // console.log({ percentageChange })

    //         setHoldingsPercentageChange(percentageChange)
    //     }
    // }, [
    //     userSolanaHoldingsAnalytic,
    //     isUserSolanaHoldingsAnalyticRefetching,
    //     isUserSolanaHoldingsAnalyticFetched,
    //     userEthereumHoldingsAnalytic,
    //     isUserEthereumHoldingsAnalyticRefetching,
    //     isUserEthereumHoldingsAnalyticFetched,
    // ])

    //balances
    const {
        data: userSolanaTokenHoldings,
        isRefetching: isUserSolanaTokenHoldingsRefetching,
        isFetched: isUserSolanaTokenHoldingsFetched,
        refetch: refetchSolanaTokenHoldings,
    } = useUserTokenHoldingsData('solana', userPublicWalletAddresses['solana'])

    const {
        data: userEthereumTokenHoldings,
        isRefetching: isUserEthereumTokenHoldingsRefetching,
        isFetched: isUserEthereumTokenHoldingsFetched,
        refetch: refetchEthereumTokenHoldings,
    } = useUserTokenHoldingsData('ethereum', userPublicWalletAddresses['ethereum'])

    const {
        data: userBaseTokenHoldings,
        isRefetching: isUserBaseTokenHoldingsRefetching,
        isFetched: isUserBaseTokenHoldingsFetched,
        refetch: refetchBaseTokenHoldings,
    } = useUserTokenHoldingsData('base', userPublicWalletAddresses['ethereum'])

    const {
        data: userArbitrumTokenHoldings,
        isLoading: isUserArbitrumTokenHoldingsRefetching,
        isFetched: isUserArbitrumTokenHoldingsFetched,
        refetch: refetchArbitrumTokenHoldings,
    } = useArbitrumWalletHoldingsData(userPublicWalletAddresses['ethereum'])

    const { data: userEthUsdcBalanceData, refetch: refetchEthUsdcBalance } = useUserTokenBalanceData('ethereum', USDC_ETHEREUM_ADDRESS)
    const { data: userSolUsdcBalanceData, refetch: refetchSolUsdcBalance } = useUserTokenBalanceData('solana', USDC_SOLANA_ADDRESS)

    const [userBalances, setUserBalances] = useState<UserTokenHoldings>([])

    // console.log(userSolanaTokenHoldings, userEthereumTokenHoldings, userArbitrumTokenHoldings, 'holdings')
    useEffect(() => {
        if (
            isUserSolanaTokenHoldingsRefetching ||
            isUserEthereumTokenHoldingsRefetching ||
            isUserBaseTokenHoldingsRefetching ||
            isUserArbitrumTokenHoldingsRefetching
        ) {
            setIsBalanceLoading(true)
        }

        if (
            isUserSolanaTokenHoldingsFetched &&
            isUserEthereumTokenHoldingsFetched &&
            isUserBaseTokenHoldingsFetched &&
            isUserArbitrumTokenHoldingsFetched &&
            !isUserSolanaTokenHoldingsRefetching &&
            !isUserEthereumTokenHoldingsRefetching &&
            !isUserBaseTokenHoldingsRefetching &&
            !isUserArbitrumTokenHoldingsRefetching
        ) {
            if (userEthereumTokenHoldings || userSolanaTokenHoldings || userBaseTokenHoldings || userArbitrumTokenHoldings || webData2) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let tempHoldings: any[] = []

                if (userEthereumTokenHoldings) {
                    tempHoldings = [...userEthereumTokenHoldings, ...tempHoldings]
                }
                if (userSolanaTokenHoldings) {
                    tempHoldings = [...userSolanaTokenHoldings, ...tempHoldings]
                }
                if (userBaseTokenHoldings) {
                    tempHoldings = [...userBaseTokenHoldings, ...tempHoldings]
                }

                // Add Arbitrum USDC balance
                if (userArbitrumTokenHoldings) {
                    const usdcArbitrumHolding = userArbitrumTokenHoldings.find(holding => holding.token.symbol === 'USDC')
                    if (usdcArbitrumHolding) {
                        tempHoldings.push({
                            token: {
                                address: usdcArbitrumHolding.token.address,
                                symbol: 'USDC',
                                name: 'USDC',
                                logo: usdcArbitrumHolding.token.logo || '/images/brand/usdc.png',
                            },
                            balance: usdcArbitrumHolding.balance,
                            usd_value: usdcArbitrumHolding.balance_usd || usdcArbitrumHolding.balance,
                            chain: 'arbitrum',
                        })
                    }
                }

                // Add Hyperliquid balances
                if (webData2) {
                    // Add USDC (Perp) balance
                    if (webData2.clearinghouseState?.marginSummary?.accountValue) {
                        tempHoldings.push({
                            token: {
                                address: 'usdc-perp',
                                symbol: 'USDC',
                                name: 'USDC (Perps)',
                                logo: '/images/brand/usdc.png',
                            },
                            balance: Number(webData2?.clearinghouseState?.marginSummary?.accountValue),
                            usd_value: Number(webData2?.clearinghouseState?.marginSummary?.accountValue),
                            chain: 'hyperliquid',
                            isHyperliquid: true,
                        })
                    }

                    // Add USDC (Spot) balance
                    const usdcSpotBalance = webData2.spotState?.balances?.find(balance => balance.coin === 'USDC')
                    if (usdcSpotBalance) {
                        tempHoldings.push({
                            token: {
                                address: 'usdc-spot',
                                symbol: 'USDC',
                                name: 'USDC (Spot)',
                                logo: '/images/brand/usdc.png',
                            },
                            balance: Number(usdcSpotBalance?.total),
                            usd_value: Number(usdcSpotBalance?.total),
                            chain: 'hyperliquid',
                            isHyperliquid: true,
                        })
                    }

                    // Add USDC (Solana) balance
                    if (userSolUsdcBalanceData) {
                        tempHoldings.push({
                            token: {
                                address: USDC_SOLANA_ADDRESS,
                                symbol: 'USDC',
                                name: 'USDC',
                                logo: '/images/brand/usdc.png',
                            },
                            balance: Number(userSolUsdcBalanceData),
                            usd_value: Number(userSolUsdcBalanceData),
                            chain: 'solana',
                        })
                    }
                }

                if (userEthUsdcBalanceData) {
                    tempHoldings.push({
                        token: {
                            address: USDC_ETHEREUM_ADDRESS,
                            symbol: 'USDC',
                            name: 'USDC',
                            logo: '/images/brand/usdc.png',
                        },
                        balance: Number(userEthUsdcBalanceData),
                        usd_value: Number(userEthUsdcBalanceData),
                        chain: 'ethereum',
                    })
                }

                if (ethTokenPrice) {
                    const ethBalance = tempHoldings.find(holding => holding.token.address === CRUSH_ETHEREUM_ADDRESS)
                    if (ethBalance && ethTokenPrice) {
                        ethBalance.usd_value = ethTokenPrice * ethBalance.balance
                    }
                }

                if (solTokenPrice) {
                    const solBalance = tempHoldings.find(holding => holding.token.address === 'So11111111111111111111111111111111111111111')
                    if (solBalance && solTokenPrice) {
                        solBalance.usd_value = solTokenPrice * solBalance.balance
                    }
                }

                const sortedHoldings = sortUserTokenHoldings(tempHoldings)

                setUserBalances(sortedHoldings)

                if (hideSmallAssets) {
                    setFilteredUserBalances(
                        sortedHoldings.filter(holdings => {
                            return holdings.usd_value > 2
                        })
                    )
                } else {
                    setFilteredUserBalances(sortedHoldings)
                }
            }
            setIsBalanceLoading(false)
        }
    }, [
        userSolanaTokenHoldings,
        userEthereumTokenHoldings,
        userBaseTokenHoldings,
        userArbitrumTokenHoldings,
        isUserSolanaTokenHoldingsRefetching,
        isUserEthereumTokenHoldingsRefetching,
        isUserBaseTokenHoldingsRefetching,
        isUserArbitrumTokenHoldingsRefetching,
        isUserSolanaTokenHoldingsFetched,
        isUserEthereumTokenHoldingsFetched,
        isUserBaseTokenHoldingsFetched,
        isUserArbitrumTokenHoldingsFetched,
        hideSmallAssets,
        webData2,
        ethTokenPrice,
        solTokenPrice,
        userSolUsdcBalanceData,
        userEthUsdcBalanceData,
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    useEffect(() => {
        if (userBalances) setTotalUserBalances(calculateTokenHoldings(userBalances))
    }, [userBalances])

    const [isBalanceActivitiesLoading, setIsBalanceActivitiesLoading] = useState(true)

    //activities
    const {
        data: userSolanaBalancesActivitiesData,
        isFetched: isSolanaBalancesActivitiesFetched,
        isRefetching: isSolanaBalancesActivitiesRefetching,
        refetch: refetchSolanaBalancesActivitiesData,
    } = useUserBalancesActivitiesData('solana')

    const {
        data: userEthereumBalancesActivitiesData,
        isFetched: isEthereumBalancesActivitiesFetched,
        isRefetching: isEthereumBalancesActivitiesRefetching,
        refetch: refetchEthereumBalancesActivitiesData,
    } = useUserBalancesActivitiesData('ethereum')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [userBalancesActivities, setUserBalancesActivities] = useState<any[]>([])
    useEffect(() => {
        if (
            isSolanaBalancesActivitiesFetched &&
            isEthereumBalancesActivitiesFetched &&
            !isSolanaBalancesActivitiesRefetching &&
            !isEthereumBalancesActivitiesRefetching
        ) {
            if (userSolanaBalancesActivitiesData || userEthereumBalancesActivitiesData) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let tempActivities: any[] = []

                if (userSolanaBalancesActivitiesData) {
                    const solanaBalancesActivities = userSolanaBalancesActivitiesData.map(data => {
                        const activities = data.activities

                        if (activities && activities.length > 0) {
                            const tempActivities = activities.map(activity => {
                                return {
                                    ...activity,
                                    chain: 'solana',
                                }
                            })
                            return {
                                ...data,
                                activities: tempActivities,
                            }
                        }
                        return data
                    })
                    tempActivities = [...solanaBalancesActivities, ...tempActivities]
                }
                if (userEthereumBalancesActivitiesData) {
                    const ethereumBalancesActivities = userEthereumBalancesActivitiesData.map(data => {
                        const activities = data.activities

                        if (activities && activities.length > 0) {
                            const tempActivities = activities.map(activity => {
                                return {
                                    ...activity,
                                    chain: 'ethereum',
                                }
                            })
                            return {
                                ...data,
                                activities: tempActivities,
                            }
                        }
                        return data
                    })

                    tempActivities = [...ethereumBalancesActivities, ...tempActivities]
                }

                const mergedUpActivities = mergeActivitiesByDate(tempActivities)
                const sortedActivities = sortActivities(mergedUpActivities)

                setUserBalancesActivities(sortedActivities)

                setIsBalanceActivitiesLoading(false)
            }

            setIsBalanceActivitiesLoading(false)
        }
    }, [
        isSolanaBalancesActivitiesRefetching,
        isEthereumBalancesActivitiesRefetching,
        isSolanaBalancesActivitiesFetched,
        isEthereumBalancesActivitiesFetched,
        userEthereumBalancesActivitiesData,
        userSolanaBalancesActivitiesData,
    ])

    const activeChains: ChainId[] = ['solana', 'ethereum']

    // const supportedChains = [
    //   {
    //     name: 'Ethereum',
    //     logo: '/images/brand/ethereum.png',
    //   },

    //   {
    //     name: 'Base',
    //     logo: '/images/brand/base.png',
    //   },

    //   {
    //     name: 'BSC',
    //     logo: '/images/brand/bsc.png',
    //   },
    // ];

    const [activeTab, setActiveTab] = useState<'Balances' | 'Activities'>('Balances')
    // const [showWithdrawForm, setShowWithdrawForm] = useState(false)

    const [totalUserBalances, setTotalUserBalances] = useState<{ balanceChange24hPercentage: number | undefined; balanceUSD: number } | undefined>(
        undefined
    )

    // const [lastUserId, setLastUserId] = useState<string | undefined>(undefined);

    const getWalletAddressLabel = (chain: ChainId) => {
        if (chain === 'solana') {
            return 'Solana Address'
        }
        if (chain === 'ethereum') {
            return 'EVM Address'
        }
        return 'Address'
    }

    const tabs: ('Balances' | 'Activities')[] = ['Balances', 'Activities']

    const handleRefresh = () => {
        // if (isBalanceLoading || isBalanceActivitiesLoading) return;

        if (activeTab === 'Balances') {
            setIsBalanceLoading(true)
            refetchSolanaTokenHoldings()
            refetchEthereumTokenHoldings()
            refetchBaseTokenHoldings()
            refetchArbitrumTokenHoldings()
            refetchEthUsdcBalance()
            refetchSolUsdcBalance()
            // refetchEthereumHoldingsAnalytic()
            // refetchSolanaHoldingsAnalytic()
            return
        }

        if (activeTab === 'Activities') {
            setIsBalanceActivitiesLoading(true)
            refetchSolanaBalancesActivitiesData()
            refetchEthereumBalancesActivitiesData()
            return
        }
    }

    if (ready && authenticated) {
        return (
            <div
                onClick={e => {
                    if (e.target === e.currentTarget && !isMobile) {
                        // Execute your logic here when clicking directly on the element itself
                        setShowWalletPanel(false)
                    }
                }}
                className="fixed inset-0 z-[200] bg-black/10 backdrop-blur-sm flex-1 overflow-hidden flex flex-col max-h-full "
            >
                <div className={`${isMobile ? 'w-full flex-col h-full' : 'fixed right-3 inset-y-3 rounded-lg  md:flex-row '} flex overflow-hidden `}>
                    {!isMobile && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowWalletPanel(false)
                                // setShowWithdrawForm(false)
                            }}
                            className=" w-14 h-full group bg-black hover:bg-table-odd apply-transition -mr-2 lg:hover:-mr-4  flex flex-col items-center justify-center border-border border overflow-hidden rounded-lg"
                        >
                            <FaChevronRight className="mr-2  lg:group-hover:mr-4 apply-transition group-hover:text-neutral-text text-neutral-text-dark" />
                        </button>
                    )}
                    <div
                        className={`flex flex-col h-full w-full md:w-[22rem]  bg-black overflow-hidden relative ${
                            isMobile ? '' : 'border border-border rounded-lg'
                        }`}
                    >
                        {/* Level XP Progress Bar */}
                        {!isMobile && (
                            <div className="p-3  border-b border-border flex flex-col ">
                                <UserXpBar />
                            </div>
                        )}

                        <div className="flex items-center w-full justify-between md:hidden p-3 border-b border-border">
                            <div className="text-base font-semibold leading-6 text-white">My Wallet</div>
                            <XButton onClick={() => setShowWalletPanel(false)} />
                        </div>

                        <div className={`p-3 flex flex-col gap-3  border-border  ${isMobile ? '' : 'border-b'}`}>
                            <div className="  rounded-lg border-border glex flex-col bg-table-odd">
                                <button
                                    className="flex items-center justify-between w-full p-3"
                                    type="button"
                                    onClick={() => setShowDepositWalletAddresses(!showDepositWalletAddresses)}
                                >
                                    <div className=" text-sm">Deposit Wallet Address</div>
                                    <FaChevronDown
                                        className={`text-neutral-300 text-2xs ml-auto transition-all duration-200 ${
                                            showDepositWalletAddresses ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {showDepositWalletAddresses && (
                                    <div className="px-3 pb-3 w-full">
                                        <div className="bg-neutral-900  flex flex-col  rounded-lg divide-y divide-neutral-800">
                                            {activeChains.map(chain => {
                                                return (
                                                    <div key={chain}>
                                                        <div className="pt-2 px-2 text-xs">{getWalletAddressLabel(chain as ChainId)}</div>
                                                        <div className="flex gap-3 items-center p-2">
                                                            <div className=" w-[20px] h-[20px] min-w-[20px] min-h-[20px] flex flex-col  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                <Image
                                                                    src={getChainImage(chain as ChainId)}
                                                                    alt={`${chain} logo`}
                                                                    width={200}
                                                                    height={200}
                                                                    className="w-full h-full object-cover object-center"
                                                                />
                                                            </div>
                                                            <div className="break-all text-neutral-text text-xs">
                                                                {userPublicWalletAddresses[chain as ChainId] ?? '-'}
                                                            </div>
                                                            {userPublicWalletAddresses[chain as ChainId] && (
                                                                <CopyToClipboard
                                                                    content={userPublicWalletAddresses[chain as ChainId]}
                                                                    iconSize={12}
                                                                    message={`${getCapitalizeFirstLetter(chain)} address copied to clipboard!`}
                                                                    className="text-neutral-text min-w-5"
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        // setShowWithdrawForm(!showWithdrawForm)
                                        handleOpenWithdrawModal()
                                    }}
                                    className="text-xs w-full"
                                    height="min-h-9 max-h-9"
                                >
                                    Withdraw
                                </Button>

                                <Button
                                    onClick={() => {
                                        handleLogout()
                                        setShowWalletPanel(false)
                                    }}
                                    className="text-xs w-full "
                                    height="min-h-9 max-h-9"
                                >
                                    Logout
                                </Button>
                            </div>
                        </div>

                        <WithdrawModal ref={withdrawModalRef} onSuccess={() => {}} onError={() => {}} userTokenHoldings={userBalances} />

                        <div className="h-full overflow-hidden flex flex-col">
                            <div className={`flex flex-col  border-border p-3 gap-1 ${isMobile ? '' : 'border-b'}`}>
                                <div className="text-[12px]">Total Balance (USD)</div>
                                <div className="flex items-end text-white text-2xl">
                                    {isBalanceLoading || !totalUserBalances ? (
                                        <TextLoading />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1 items-end">
                                                <div className="font-medium leading-none">
                                                    {totalUserBalances.balanceUSD > 0 ? getReadableNumber(totalUserBalances.balanceUSD, 2, '$') : '-'}
                                                    {/* {totalUserBalances.balanceUSD > 0
                            ? totalUserBalances.balanceUSD.toFixed(2)
                            : '-'} */}
                                                </div>
                                                {/* <div className="text-sm mb-[1px] leading-none">USD</div> */}
                                            </div>
                                        </div>
                                    )}

                                    {/* {!isBalanceLoading &&
                                        totalUserBalances &&
                                        holdingsPercentageChange !== undefined &&
                                        holdingsPercentageChange !== 0 &&
                                        !Number.isNaN(holdingsPercentageChange) && (
                                            <Tooltip text="Today PNL">
                                                <PercentageChange size="small" percentage={holdingsPercentageChange}></PercentageChange>
                                            </Tooltip>
                                        )} */}
                                </div>
                            </div>

                            <div className={`flex p-2 gap-2 border-border relative ${isMobile ? '' : 'border-b'}`}>
                                {tabs.map(tab => {
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                setActiveTab(tab)
                                            }}
                                            className={` flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-900 duration-200 transition-all  px-2 rounded-md font-semibold ${
                                                activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    )
                                })}

                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={
                                        activeTab === 'Balances' ? isBalanceLoading : activeTab === 'Activities' ? isBalanceActivitiesLoading : false
                                    }
                                    className={`ml-auto flex hover:bg-neutral-900 border-border border bg-table-odd rounded-lg w-7 h-7 items-center justify-center text-neutral-text apply-transition`}
                                >
                                    <FaArrowsRotate
                                        className={` ${
                                            (activeTab === 'Balances' && isBalanceLoading) ||
                                            (activeTab === 'Activities' && isBalanceActivitiesLoading)
                                                ? 'animate-spin'
                                                : 'text-xs'
                                        }`}
                                    />
                                </button>

                                <HideSmallAssetsButton />
                            </div>
                            {activeTab === 'Balances' && (
                                <div className="h-full overflow-y-auto flex flex-col mb-0">
                                    {isBalanceLoading ? (
                                        <>
                                            {Array.from({ length: 10 }).map((_, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex justify-between items-center gap-3 p-3  border-border/50 ${
                                                            isMobile ? '' : 'border-b'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-border animate-pulse min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center "></div>
                                                            <TextLoading />
                                                        </div>

                                                        <div className="flex flex-col  items-end max-w-full overflow-hidden">
                                                            <div className="text-sm">
                                                                <TextLoading />
                                                            </div>
                                                            <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
                                                                <TextLoading />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {filteredUserBalances &&
                                                filteredUserBalances.length > 0 &&
                                                filteredUserBalances.map(balance => {
                                                    if (balance.usd_value <= 0) return
                                                    return (
                                                        <Link
                                                            onClick={() => {
                                                                setShowWalletPanel(false)
                                                                setLastSelectedToken({
                                                                    address: balance.token.address,
                                                                    chain: balance.chain,
                                                                })
                                                            }}
                                                            key={balance.token.address}
                                                            href={getTokenUrl(balance.chain ?? 'solana', balance.token.address, isMobile)}
                                                            className={`flex justify-between items-center gap-3 hover:bg-table-odd apply-transition p-3  border-border/50 ${
                                                                isMobile ? '' : 'border-b'
                                                            }    ${
                                                                mainCurrencyChainAddresses.includes(balance.token.address) ||
                                                                balance.token.address.toLowerCase().includes('usdc') ||
                                                                balance.token.symbol?.toLowerCase() === 'usdc' ||
                                                                balance.isHyperliquid
                                                                    ? ' pointer-events-none'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-black min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border relative flex items-center justify-center ">
                                                                    <ImageFallback
                                                                        src={balance.token.logo}
                                                                        alt={`${balance.token.name} logo`}
                                                                        width={200}
                                                                        height={200}
                                                                        className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                                                    />
                                                                    {!mainCurrencyChainAddresses.includes(balance.token.address) && (
                                                                        <div className="absolute flex flex-col w-[16px] h-[16px] min-w-[16px] min-h-[16px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                            <Image
                                                                                src={getChainImage(balance.chain)}
                                                                                alt={`${balance.chain} logo`}
                                                                                width={200}
                                                                                height={200}
                                                                                className=" w-full h-full object-cover object-center"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    {/* Add USDC chain icon for USDC tokens */}
                                                                    {(balance.token.address.toLowerCase().includes('usdc-perp') ||
                                                                        balance.token.address.toLowerCase().includes('usdc-spot')) && (
                                                                        <div className="absolute flex flex-col w-[16px] h-[16px] min-w-[16px] min-h-[16px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                            <Image
                                                                                src="/images/brand/hyperliquid.png"
                                                                                alt="USDC logo"
                                                                                width={200}
                                                                                height={200}
                                                                                className="w-full h-full object-cover object-center"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className=" w-36 min-w-36 max-w-36 overflow-clip text-nowrap text-ellipsis  text-sm">
                                                                    {mainCurrencyChainAddresses.includes(balance.token.address)
                                                                        ? balance.token.symbol?.toUpperCase()
                                                                        : balance.token.address.toLowerCase().includes('usdc')
                                                                        ? balance.token.name
                                                                        : balance.token.symbol}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col  items-end max-w-full overflow-hidden">
                                                                <div className="text-sm text-right">
                                                                    {getReadableNumber(balance.balance, 3)}{' '}
                                                                    {mainCurrencyChainAddresses.includes(balance.token.address)
                                                                        ? balance.token.symbol?.toUpperCase()
                                                                        : balance.token.symbol ?? '-'}
                                                                </div>
                                                                <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
                                                                    {getReadableNumber(balance.usd_value, 2, '$')}
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    )
                                                })}

                                            {userBalances && userBalances.length === 0 && <EmptyData />}
                                        </>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Activities' && (
                                <div className="h-full overflow-y-auto flex flex-col">
                                    {isBalanceActivitiesLoading ? (
                                        <>
                                            {Array.from({ length: 10 }).map((_, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`flex justify-between items-center gap-3 p-3  border-border/50 ${
                                                            isMobile ? '' : 'border-b'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-border animate-pulse min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center "></div>
                                                            <TextLoading />
                                                        </div>

                                                        <div className="flex flex-col  items-end max-w-full overflow-hidden">
                                                            <div className="text-sm">
                                                                <TextLoading />
                                                            </div>
                                                            <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
                                                                <TextLoading />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {userBalancesActivities && userBalancesActivities.length === 0 && <EmptyData />}
                                            {userBalancesActivities &&
                                                userBalancesActivities.length > 0 &&
                                                filterWalletActivities(userBalancesActivities).map(day => {
                                                    return (
                                                        <div
                                                            key={day.date}
                                                            className={`flex flex-col border-border/50 ${isMobile ? '' : 'border-b'}`}
                                                        >
                                                            <div className="p-3 ">{formatDateForWalletActivity(day.date)}</div>
                                                            {day.activities.map((activity, index) => {
                                                                if (activity.amount * activity.priceUSD > 0.01) {
                                                                    return (
                                                                        <Link
                                                                            onClick={() => {
                                                                                setShowWalletPanel(false)
                                                                            }}
                                                                            target="_blank"
                                                                            key={`${activity.transactionHash}-${index}`}
                                                                            href={`${getExplorerUrl(
                                                                                activity.chain ?? 'solana',
                                                                                activity.transactionHash
                                                                            )}`}
                                                                            // href={`${chain.explorer.tx}/${activity.transactionHash}`}
                                                                            className="flex justify-between items-center gap-3 hover:bg-table-odd apply-transition p-3 "
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="bg-black min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border  relative flex items-center justify-center ">
                                                                                    <ImageFallback
                                                                                        src={`${activity.tokenLogo}`}
                                                                                        alt={`${activity.tokenName} logo`}
                                                                                        width={200}
                                                                                        height={200}
                                                                                        className=" w-full h-full object-cover object-center rounded-full overflow-hidden"
                                                                                    />
                                                                                    {!mainCurrencyChainAddresses.includes(activity.tokenAddress) && (
                                                                                        <div className="absolute flex flex-col w-[16px] h-[16px] min-w-[16px] min-h-[16px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                                            <Image
                                                                                                src={getChainImage(activity.chain)}
                                                                                                alt={`${activity.chain} logo`}
                                                                                                width={200}
                                                                                                height={200}
                                                                                                className=" w-full h-full object-cover object-center"
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <div className=" w-36 min-w-36 max-w-36 overflow-clip text-nowrap text-ellipsis  text-sm">
                                                                                    {getActivityName(activity.type, activity.tokenSymbol)}
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex flex-col  items-end max-w-full overflow-hidden ">
                                                                                <div
                                                                                    className={`text-xs w-full break-all text-right text-ellipsis ${getTextColor(
                                                                                        activity.type
                                                                                    )}`}
                                                                                >
                                                                                    {getActivitySymbol(activity.type)}{' '}
                                                                                    {getReadableNumber(activity.amount, 2)}{' '}
                                                                                    {activity.tokenSymbol.toUpperCase()}
                                                                                </div>
                                                                                <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
                                                                                    {getReadableNumber(activity.priceUSD, 2, '$')}
                                                                                </div>
                                                                            </div>
                                                                        </Link>
                                                                    )
                                                                }
                                                            })}
                                                        </div>
                                                    )
                                                })}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="flex w-full flex-col items-center justify-center p-3 flex-1 gap-3">
                <div>Sign in to view your wallet</div>
                <button type="button" className="border-b border-white" onClick={handleSignIn}>
                    Sign In
                </button>
            </div>
        )
    }
}

export default WalletPanel
