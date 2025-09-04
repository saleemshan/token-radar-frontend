import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import React, { useRef } from 'react'
import TableRowLoading from '../TableRowLoading'
import { getSlicedAddress } from '@/utils/crypto'
import { useUser } from '@/context/UserContext'

import useTokenDevInfoData from '@/hooks/data/useTokenDevInfoData'
import useTokenInsiderAnalysisData from '@/hooks/data/useTokenInsiderAnalysisData'
import TextLoading from '../TextLoading'
import useControlledScroll from '@/hooks/useControlledScroll'
import { getUppercaseFirstLetter } from '@/utils/string'
import { getInsiderColor } from '@/utils/textColor'

const InsidersAnalyticsTable = ({ tokenAddress }: { tokenAddress: string }) => {
    const { chain } = useUser()

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    const { data: tokenDevInfoData, isLoading: tokenDevInfoIsLoading } = useTokenDevInfoData(chain.api, tokenAddress)

    const { data: insiderAnalysisData, isLoading: insiderAnalysisIsLoading } = useTokenInsiderAnalysisData(chain.api, tokenAddress)

    // Calculate initial amount from transactions data
    const calculateInitialHoldingPercentage = () => {
        if (!tokenDevInfoData?.transactions || tokenDevInfoData.transactions.length === 0) {
            return 0
        }

        if (!insiderAnalysisData?.total_supply) return 0

        // Find the first buy transaction
        const firstBuyTransaction = tokenDevInfoData.transactions.find(tx => tx.type === 'buy' || tx.type === 'add')
        if (!firstBuyTransaction) return 0

        // Calculate percentage based on first transaction amount
        const initialAmount = Number(firstBuyTransaction.amount)
        const totalSupply = Number(insiderAnalysisData.total_supply)

        return (initialAmount / totalSupply) * 100
    }

    // Add this function to calculate the current holding value
    const calculateCurrentHoldingValue = () => {
        if (!tokenDevInfoData?.analytics || tokenDevInfoData.analytics.balance === undefined) {
            return 0
        }
        if (tokenDevInfoData.analytics.unrealized_pnl_usd && Number(tokenDevInfoData.analytics.balance) > 0) {
            return Number(tokenDevInfoData.analytics.unrealized_pnl_usd)
        }

        // If unrealized value not available, fall back to using the bought_average_price
        if (tokenDevInfoData.analytics.bought_average_price) {
            return Number(tokenDevInfoData.analytics.balance) * Number(tokenDevInfoData.analytics.bought_average_price)
        }

        return 0
    }

    const devCurrentHoldingPercentage = () => {
        if (!tokenDevInfoData?.analytics || tokenDevInfoData.analytics.balance === undefined) {
            return 0
        }
        const totalSupply = Number(insiderAnalysisData?.total_supply)

        if (totalSupply === 0) return 0

        return (Number(tokenDevInfoData.analytics.balance) / totalSupply) * 100
    }

    // Add this function to calculate combined holding percentage
    const getCombinedHoldingPercentage = () => {
        const insiderPercentage = Number(insiderAnalysisData?.graph_data?.holding_percentage || 0)

        const devPercentage = devCurrentHoldingPercentage()

        return insiderPercentage + devPercentage
    }

    return (
        <div className="flex-1  xl:max-h-[60vh] min-h-[60vh] overflow-hidden flex flex-col">
            <div className="flex flex-col overflow-hidden w-full max-h-full min-h-full flex-1">
                <div className="flex flex-col gap-6  h-full  border-b border-border">
                    <div className="flex flex-col divide-y divide-border">
                        <>
                            <div className="flex flex-col p-3 gap-2">
                                <div className="">Holding by Insiders & Dev</div>
                                <div className="flex-1 flex justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className={`text-sm ${getInsiderColor(getCombinedHoldingPercentage())}`}>
                                            {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                                <TextLoading />
                                            ) : (
                                                `${getCombinedHoldingPercentage().toFixed(2)}%`
                                            )}
                                        </span>
                                        <span className="text-neutral-text-dark text-xs">Hold</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="text-neutral-text-dark text-xs flex flex-col">Sold</div>
                                        <span className="text-neutral-text text-sm">
                                            {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                                <TextLoading />
                                            ) : (
                                                `${(100 - getCombinedHoldingPercentage()).toFixed(2)}%`
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 flex w-full rounded-full overflow-hidden">
                                    <div
                                        className="flex flex-col bg-positive/80 min-h-1"
                                        style={{
                                            width: `${insiderAnalysisIsLoading || tokenDevInfoIsLoading ? 50 : getCombinedHoldingPercentage()}%`,
                                        }}
                                    />
                                    <div
                                        className="flex flex-col bg-negative/80 min-h-1"
                                        style={{
                                            width: `${
                                                insiderAnalysisIsLoading || tokenDevInfoIsLoading ? 50 : 100 - getCombinedHoldingPercentage()
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 lg:grid-cols-5 p-3">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-xs mb-2 text-neutral-text-dark leading-none">Balance</div>
                                    <div className="leading-none text-sm text-neutral-text">
                                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                            <TextLoading />
                                        ) : (
                                            <>
                                                {getReadableNumber(
                                                    (insiderAnalysisData?.analytics?.current_holdings || 0) +
                                                        (tokenDevInfoData?.analytics?.balance ? Number(tokenDevInfoData.analytics.balance) : 0),
                                                    countDecimalPlaces(insiderAnalysisData?.analytics?.current_holdings || 0),
                                                    ''
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-xs mb-2 text-neutral-text-dark leading-none">Total Bought</div>
                                    <div className="leading-none text-sm text-neutral-text">
                                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                            <TextLoading />
                                        ) : (
                                            <>
                                                {getReadableNumber(
                                                    (insiderAnalysisData?.analytics?.total_bought || 0) +
                                                        (tokenDevInfoData?.analytics?.history_bought_amount
                                                            ? Number(tokenDevInfoData.analytics.history_bought_amount)
                                                            : 0),
                                                    countDecimalPlaces(insiderAnalysisData?.analytics?.total_bought || 0),
                                                    ''
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-xs mb-2 text-neutral-text-dark leading-none">Unrealised</div>
                                    <div className="leading-none text-sm text-neutral-text">
                                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                            <TextLoading />
                                        ) : (
                                            <>
                                                {getReadableNumber(
                                                    (insiderAnalysisData?.analytics?.unrealised_value || 0) +
                                                        (tokenDevInfoData?.analytics?.unrealized_pnl_usd
                                                            ? Number(tokenDevInfoData.analytics.unrealized_pnl_usd)
                                                            : 0),
                                                    countDecimalPlaces(insiderAnalysisData?.analytics?.unrealised_value || 0),
                                                    '$'
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-xs mb-2 text-neutral-text-dark leading-none">Realised</div>
                                    <div className="leading-none text-sm text-neutral-text">
                                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                            <TextLoading />
                                        ) : (
                                            <>
                                                {getReadableNumber(
                                                    (insiderAnalysisData?.analytics?.realised_value || 0) +
                                                        (tokenDevInfoData?.analytics?.realized_pnl_usd
                                                            ? Number(tokenDevInfoData.analytics.realized_pnl_usd)
                                                            : 0),
                                                    countDecimalPlaces(insiderAnalysisData?.analytics?.realised_value || 0),
                                                    '$'
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-xs mb-2 text-neutral-text-dark leading-none">Insiders</div>
                                    <div className="leading-none text-sm text-neutral-text">
                                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                                            <TextLoading />
                                        ) : (
                                            <>
                                                {insiderAnalysisData && insiderAnalysisData.analytics
                                                    ? insiderAnalysisData.analytics.insider_count
                                                    : '-'}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    </div>
                </div>

                <div ref={tableContainerRef} className="  overflow-x-auto  overflow-y-auto h-full max-h-full no-scrollbar  flex-1">
                    <table className=" table-auto w-full min-h-fit relative">
                        <thead className=" w-full sticky  md:top-0 uppercase bg-black text-sm z-20">
                            <tr className="w-full text-neutral-text-dark relative">
                                <th className="py-3 text-xs text-left px-2 text-nowrap ">
                                    Address
                                    <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                                </th>
                                <th className="py-3 text-xs text-center px-2 text-nowrap">Current Supply Held</th>
                                <th className="py-3 text-xs text-center px-2 text-nowrap">Initial Supply Held</th>
                                <th className="py-3 text-xs text-center px-2 text-nowrap">Current Holding Value (USDT)</th>
                                <th className="py-3 text-xs text-center px-2 text-nowrap">Type</th>
                            </tr>
                        </thead>
                        {insiderAnalysisIsLoading || tokenDevInfoIsLoading ? (
                            <TableRowLoading totalTableData={5} totalRow={15} className="px-2 items-center" />
                        ) : (
                            <tbody className="w-full text-xs">
                                {/* Add dev info first if it exists */}
                                {tokenDevInfoData?.analytics && tokenDevInfoData?.analytics?.accountAddress && (
                                    <tr>
                                        <td className="text-left px-2 py-3 text-nowrap">
                                            {getSlicedAddress(tokenDevInfoData.analytics.accountAddress || '', 3, '-')}
                                        </td>
                                        <td className="text-center px-2 py-3 text-nowrap">{devCurrentHoldingPercentage().toFixed(4)}%</td>
                                        <td className="text-center px-2 py-3 text-nowrap">
                                            {tokenDevInfoData?.transactions && tokenDevInfoData.transactions.length > 0
                                                ? `${calculateInitialHoldingPercentage().toFixed(2)}%`
                                                : '0%'}
                                        </td>
                                        <td className="text-center px-2 py-3 text-nowrap">
                                            {getReadableNumber(calculateCurrentHoldingValue(), undefined, '$')}
                                        </td>
                                        <td className="text-center px-2 py-3 text-nowrap">Dev</td>
                                    </tr>
                                )}
                                {/* Existing insider rows */}
                                {insiderAnalysisData?.holders?.map(data => {
                                    return (
                                        <tr key={data.address}>
                                            <td className="text-left px-2 py-3 text-nowrap">{getSlicedAddress(data.address, 3, '-')}</td>
                                            <td className="text-center px-2 py-3 text-nowrap">{data.percentage_held ?? '-'}%</td>
                                            <td className="text-center px-2 py-3 text-nowrap">{data.initial_supply_held ?? '-'}%</td>
                                            <td className="text-center px-2 py-3 text-nowrap">
                                                {getReadableNumber(data.current_holding_value ?? 0, undefined, '$')}
                                            </td>
                                            <td className="text-center px-2 py-3 text-nowrap">
                                                {data.label ? getUppercaseFirstLetter(data.label) : '-'}
                                            </td>
                                        </tr>
                                    )
                                })}

                                {insiderAnalysisData?.holders?.length === 0 && !tokenDevInfoData?.analytics?.accountAddress && (
                                    <tr>
                                        <td colSpan={5} className="text-center px-2 py-3 text-nowrap">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default InsidersAnalyticsTable
