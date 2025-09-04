'use client'
import React from 'react'
import Tooltip from '../Tooltip'
import { useWebDataContext } from '@/context/webDataContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { FaCircleInfo } from 'react-icons/fa6'

const PortfolioStatusCard = () => {
    const { webData2 } = useWebDataContext()
    const { spotTokensData } = usePairTokensContext()

    // Calculate spot balance in USD
    const spotBalanceUsd = React.useMemo(() => {
        if (!webData2?.spotState?.balances || !spotTokensData) return 0

        return webData2.spotState.balances.reduce((total, balance) => {
            // USDC is already in USD
            if (balance.coin === 'USDC') {
                return total + parseFloat(balance.total)
            }

            // For other tokens, find price from spotTokensData
            const tokenData = spotTokensData.find(token => token.name === balance.coin)

            if (tokenData) {
                return total + parseFloat(balance.total) * parseFloat(tokenData.markPx || '0')
            }

            return total
        }, 0)
    }, [webData2?.spotState?.balances, spotTokensData])

    // Perps account data
    const accountValue = parseFloat(webData2?.clearinghouseState?.marginSummary?.accountValue || '0')

    const maintenanceMargin = parseFloat(webData2?.clearinghouseState?.crossMaintenanceMarginUsed || '0')
    const totalNtlPos = parseFloat(webData2?.clearinghouseState?.marginSummary?.totalNtlPos || '0')

    // Calculate unrealized PNL by summing up from all asset positions
    const unrealizedPnl = React.useMemo(() => {
        if (!webData2?.clearinghouseState?.assetPositions) return 0

        return webData2.clearinghouseState.assetPositions.reduce((total, asset) => {
            return total + parseFloat(asset.position?.unrealizedPnl || '0')
        }, 0)
    }, [webData2?.clearinghouseState?.assetPositions])

    // Calculate cross margin ratio
    const crossMarginRatio = accountValue > 0 ? (maintenanceMargin / accountValue) * 100 : 0

    // Calculate cross account leverage
    const crossAccountLeverage = accountValue > 0 ? totalNtlPos / accountValue : 0

    return (
        <div className="flex flex-col gap-3 p-3 bg-black border-t border-border text-xs">
            <div className="flex flex-col gap-2 ">
                <h2 className="text-neutral-text text-sm font-semibold">Account Equity</h2>

                {/* Spot Section */}
                <div className="flex justify-between items-center">
                    <span className="text-neutral-text-dark">Spot</span>
                    <span className="text-neutral-text">${spotBalanceUsd.toFixed(2)}</span>
                </div>

                {/* Perps Section */}
                <div className="flex justify-between items-center">
                    <div className="max-w-52 bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text-dark">Perps</span>
                        <Tooltip text="Balance + Unrealized PNL (approximated account value if all positions were closed)">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    <span className="text-neutral-text">${accountValue.toFixed(2)}</span>
                </div>
            </div>

            {/* Perps Overview Section */}
            <div className="flex flex-col gap-2">
                <h3 className="text-neutral-text text-sm font-semibold">Perps Overview</h3>

                <div className="flex justify-between items-center">
                    <div className="max-w-52 bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text-dark">Balance</span>
                        <Tooltip text="Total Net Transfers + Total Realized Profit + Total Net Funding Fees">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>

                    <span className="text-neutral-text">${accountValue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-neutral-text-dark">Unrealized PNL</span>
                    <span className={`${unrealizedPnl > 0 ? 'text-positive' : unrealizedPnl < 0 ? 'text-negative' : 'text-neutral-text'}`}>
                        ${unrealizedPnl.toFixed(2)}
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="max-w-52 bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text-dark">Cross Margin Ratio</span>
                        <Tooltip text="Maintenance Margin / Portfolio Value. Your cross positions will be Liquidated if Margin Ratio reaches 100%.">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>

                    <span>{crossMarginRatio.toFixed(2)}%</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="max-w-52 bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text-dark">Maintenance Margin</span>
                        <Tooltip text="The minimum portfolio value required to keep your cross positions open.">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    <span className="text-neutral-text">${maintenanceMargin.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                    <div className="max-w-52 bg-black font-semibold text-left flex items-center gap-1">
                        <span className="text-neutral-text-dark">Cross Account Leverage</span>
                        <Tooltip text="Cross Account Leverage = Total Cross Position Value /  Cross Account Value">
                            <FaCircleInfo className="text-[9px] text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    <span className="text-neutral-text">{crossAccountLeverage.toFixed(2)}x</span>
                </div>
            </div>
        </div>
    )
}

export default PortfolioStatusCard
