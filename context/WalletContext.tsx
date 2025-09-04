'use client'

import { createContext, useState, ReactNode, useContext, useEffect } from 'react'
import { useWebDataContext } from './webDataContext'
import useUserTokenBalanceData from '@/hooks/data/useUserTokenBalance'
import { CRUSH_BASE_ADDRESS, CRUSH_ETHEREUM_ADDRESS, CRUSH_SOLANA_ADDRESS } from '@/data/default/chains'
import { usePairTokensContext } from './pairTokensContext'

interface WalletContextProps {
    solBalance: TokenBalance | undefined
    mainnetEthBalance: TokenBalance | undefined
    baseEthBalance: TokenBalance | undefined
    hyperliquidSpotUSDCBalance: TokenBalance | undefined
    hyperliquidPerpsUSDCBalance: TokenBalance | undefined
}

const WalletContext = createContext<WalletContextProps | undefined>(undefined)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
    const { webData2 } = useWebDataContext()
    const { solTokenPrice, ethTokenPrice } = usePairTokensContext()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: solBalanceData, isLoading: isSolBalanceLoading } = useUserTokenBalanceData('solana', CRUSH_SOLANA_ADDRESS ?? '')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: mainnetEthBalanceData, isLoading: isMainnetEthBalanceLoading } = useUserTokenBalanceData('ethereum', CRUSH_ETHEREUM_ADDRESS ?? '')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: baseEthBalanceData, isLoading: isBaseEthBalanceLoading } = useUserTokenBalanceData('ethereum', CRUSH_BASE_ADDRESS ?? '')

    const [solBalance, setSolBalance] = useState<TokenBalance | undefined>(undefined)
    const [mainnetEthBalance, setMainnetEthBalance] = useState<TokenBalance | undefined>(undefined)
    const [baseEthBalance, setBaseEthBalance] = useState<TokenBalance | undefined>(undefined)
    const [hyperliquidSpotUSDCBalance, setHyperliquidSpotUSDCBalance] = useState<TokenBalance | undefined>(undefined)
    const [hyperliquidPerpsUSDCBalance, setHyperliquidPerpsUSDCBalance] = useState<TokenBalance | undefined>(undefined)

    useEffect(() => {
        if (solBalanceData && solTokenPrice) {
            setSolBalance({
                token: {
                    address: CRUSH_SOLANA_ADDRESS,
                    symbol: 'SOL',
                    name: 'SOL',
                    logo: '/images/brand/solana.png',
                },
                balance: solBalanceData,
                usd_value: solTokenPrice * solBalanceData,
                chain: 'solana',
                isHyperliquid: false,
            })
        }
    }, [solBalanceData, solTokenPrice])

    useEffect(() => {
        if (mainnetEthBalanceData && ethTokenPrice) {
            setMainnetEthBalance({
                token: {
                    address: CRUSH_ETHEREUM_ADDRESS,
                    symbol: 'ETH',
                    name: 'ETH',
                    logo: '/images/brand/ethereum.png',
                },
                balance: mainnetEthBalanceData,
                usd_value: ethTokenPrice * mainnetEthBalanceData,
                chain: 'ethereum',
                isHyperliquid: false,
            })
        }
    }, [mainnetEthBalanceData, ethTokenPrice])

    useEffect(() => {
        if (baseEthBalanceData && ethTokenPrice) {
            setBaseEthBalance({
                token: {
                    address: CRUSH_BASE_ADDRESS,
                    symbol: 'ETH',
                    name: 'ETH',
                    logo: '/images/brand/ethereum.png',
                },
                balance: baseEthBalanceData,
                usd_value: ethTokenPrice * baseEthBalanceData,
                chain: 'base',
                isHyperliquid: false,
            })
        }
    }, [baseEthBalanceData, ethTokenPrice])

    useEffect(() => {
        if (webData2) {
            if (webData2.clearinghouseState?.marginSummary?.accountValue) {
                setHyperliquidPerpsUSDCBalance({
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

            const usdcSpotBalance = webData2.spotState?.balances?.find(balance => balance.coin === 'USDC')
            if (usdcSpotBalance) {
                setHyperliquidSpotUSDCBalance({
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
        }
    }, [webData2])

    return (
        <WalletContext.Provider value={{ solBalance, mainnetEthBalance, baseEthBalance, hyperliquidSpotUSDCBalance, hyperliquidPerpsUSDCBalance }}>
            {children}
        </WalletContext.Provider>
    )
}

export const useWallet = () => {
    const context = useContext(WalletContext)
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider')
    }
    return context
}
