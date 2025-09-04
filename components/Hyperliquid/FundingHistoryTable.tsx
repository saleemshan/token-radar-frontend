import React, { useRef } from 'react'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import useControlledScroll from '@/hooks/useControlledScroll'
import TableRowLoading from '../TableRowLoading'
import { useSettingsContext } from '@/context/SettingsContext'
import { getReadableUnixTimestamp } from '@/utils/time'
import { formatCryptoPrice } from '@/utils/price'
import EmptyData from '../global/EmptyData'
import useIsMobile from '@/hooks/useIsMobile'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { useTradeHistoryContext } from '@/context/tradeHistoryContext'
import { FundingData } from '@/types/hyperliquid'

const FundingHistoryTable = () => {
    const { ready, authenticated } = usePrivy()
    const { setTokenId } = usePairTokensContext()
    const { timezone } = useSettingsContext()
    const { login: handleSignIn } = useLogin()
    const isMobile = useIsMobile()

    // Use context for funding data instead of local state
    const { fundingData, loadingFundingData } = useTradeHistoryContext()

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    return (
        <div className="flex flex-col h-full max-h-full relative flex-1 overflow-hidden">
            {ready && authenticated ? (
                <>
                    {!isMobile && (
                        <div ref={tableContainerRef} className="overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                            <table className="table-auto w-full">
                                <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                                    <tr className="w-full text-neutral-text-dark relative">
                                        <th className="py-3 text-xs px-4 text-nowrap text-left">Time</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Coin</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Size</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Position Side</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Payment</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Rate</th>
                                    </tr>
                                </thead>

                                {loadingFundingData ? (
                                    <TableRowLoading totalTableData={6} totalRow={15} className="px-2 items-center" />
                                ) : (
                                    <tbody className="w-full text-xs">
                                        {fundingData && fundingData.length > 0 ? (
                                            fundingData
                                                .sort((a: FundingData, b: FundingData) => b.time - a.time)
                                                .map((funding: FundingData, index: number) => (
                                                    <tr key={index} className="bg-table-even border-b border-border/80 apply-transition relative">
                                                        <td className="py-3 px-4">{getReadableUnixTimestamp(funding.time, timezone)}</td>
                                                        <td
                                                            className="py-3 px-4 text-center cursor-pointer"
                                                            onClick={() => {
                                                                setTokenId(funding.coin)
                                                            }}
                                                        >
                                                            {funding.coin}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            {funding.szi || '0'} {funding.coin}
                                                        </td>
                                                        <td
                                                            className={`py-3 px-4 text-center ${
                                                                Number(funding.szi) >= 0 ? 'text-positive' : 'text-negative'
                                                            }`}
                                                        >
                                                            {Number(funding.szi) >= 0 ? 'Long' : 'Short'}
                                                        </td>
                                                        <td
                                                            className={`py-3 px-4 text-center ${
                                                                Number(funding.usdc) >= 0 ? 'text-positive' : 'text-negative'
                                                            }`}
                                                        >
                                                            ${formatCryptoPrice(Number(funding.usdc), 4)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">{(Number(funding.fundingRate) * 100).toFixed(4)}%</td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-3">
                                                    <EmptyData text="No Funding History" />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    )}

                    {isMobile && (
                        <div className="w-full flex-1 overflow-y-auto h-full mobile-no-scrollbar flex flex-col">
                            {fundingData && fundingData.length > 0 ? (
                                fundingData
                                    .sort((a: FundingData, b: FundingData) => b.time - a.time)
                                    .map((funding: FundingData, index: number) => (
                                        <div key={index} className=" bg-table-even border-b border-border apply-transition relative py-2">
                                            <div className="flex items-center px-3 justify-between">
                                                <div className="flex flex-row items-center gap-1">
                                                    <div
                                                        className=" text-left text-sm font-bold"
                                                        onClick={() => {
                                                            setTokenId(funding.coin)
                                                        }}
                                                    >
                                                        {funding.coin}
                                                    </div>
                                                    <div className="px-1 rounded h-4 leading-4 flex flex-col text-[8px] text-neutral-text-dark bg-neutral-text-dark/20">
                                                        Funding
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xs text-neutral-text-dark">Payment</span>
                                                    <span
                                                        className={`text-sm font-bold ${
                                                            Number(funding.usdc) >= 0 ? 'text-positive' : 'text-negative'
                                                        }`}
                                                    >
                                                        ${formatCryptoPrice(Number(funding.usdc), 4)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 pt-1">
                                                <div className="py-1 px-3 flex flex-col">
                                                    <span className="text-2xs text-neutral-text-dark">Size</span>
                                                    <div className="flex flex-col text-xs">
                                                        {funding.szi || '0'} {funding.coin}
                                                    </div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1">
                                                    <span className="text-2xs text-neutral-text-dark">Position Side</span>
                                                    <div
                                                        className={`flex flex-col text-xs ${
                                                            Number(funding.szi) >= 0 ? 'text-positive' : 'text-negative'
                                                        }`}
                                                    >
                                                        {Number(funding.szi) >= 0 ? 'Long' : 'Short'}
                                                    </div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1">
                                                    <span className="text-2xs text-neutral-text-dark">Rate</span>
                                                    <div className="flex flex-col text-xs">{(Number(funding.fundingRate) * 100).toFixed(4)}%</div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1 items-end">
                                                    <span className="text-2xs text-neutral-text-dark text-right">Time</span>
                                                    <div className="flex flex-col text-xs text-right">
                                                        {getReadableUnixTimestamp(funding.time, timezone)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <EmptyData text="No Trade History" />
                            )}
                        </div>
                    )}
                </>
            ) : (
                <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
                    <button type="button" onClick={handleSignIn} className="underline">
                        Sign in
                    </button>
                    <span>{`to see your trade history`}</span>
                </div>
            )}
        </div>
    )
}

export default FundingHistoryTable
