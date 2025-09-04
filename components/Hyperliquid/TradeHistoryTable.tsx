import React, { useRef, useMemo } from 'react'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import useControlledScroll from '@/hooks/useControlledScroll'
import TableRowLoading from '../TableRowLoading'
import { useSettingsContext } from '@/context/SettingsContext'
import { getReadableUnixTimestamp } from '@/utils/time'
import { formatCryptoPrice } from '@/utils/price'
import useHyperliquidUserFillsData from '@/hooks/data/useHyperliquidUserFillsData'
import { useUser } from '@/context/UserContext'
import EmptyData from '../global/EmptyData'
import useIsMobile from '@/hooks/useIsMobile'
import { usePairTokensContext } from '@/context/pairTokensContext'

const TradeHistoryTable = () => {
    const { ready, authenticated } = usePrivy()
    const { setTokenId } = usePairTokensContext()
    const { timezone } = useSettingsContext()
    const { login: handleSignIn } = useLogin()
    const isMobile = useIsMobile()

    const { userPublicWalletAddresses } = useUser()

    const params = useMemo(() => {
        const now = Date.now()
        const startDate = new Date(now)
        startDate.setMonth(startDate.getMonth() - 6)

        return {
            user: userPublicWalletAddresses['ethereum'],
            aggregateByTime: true,
            startTime: Math.floor(startDate.getTime() / 1000).toString(),
        }
    }, [userPublicWalletAddresses])

    const { data: userFillsData, isLoading: isLoadingUserFillsData } = useHyperliquidUserFillsData(params, {
        refetchInterval: 3000,
        refetchOnWindowFocus: false,
    })

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
                                        <th className="py-3 text-xs px-4 text-nowrap">Direction</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Price</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Size</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Trade Value</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Fee</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Closed PNL</th>
                                    </tr>
                                </thead>

                                {isLoadingUserFillsData ? (
                                    <TableRowLoading totalTableData={8} totalRow={15} className="px-2 items-center" />
                                ) : (
                                    <tbody className="w-full text-xs">
                                        {userFillsData && userFillsData.length > 0 ? (
                                            userFillsData
                                                .sort((a, b) => b.time - a.time)
                                                .map((trade, index) => (
                                                    <tr key={index} className="bg-table-even border-b border-border/80 apply-transition relative">
                                                        <td className="py-3 px-4">{getReadableUnixTimestamp(trade.time, timezone)}</td>
                                                        <td
                                                            className="py-3 px-4 text-center cursor-pointer"
                                                            onClick={() => {
                                                                setTokenId(trade.coin)
                                                            }}
                                                        >
                                                            {trade.coin}
                                                        </td>
                                                        <td
                                                            className={`py-3 px-4 text-center ${
                                                                trade.side === 'B' ? 'text-positive' : 'text-negative'
                                                            } `}
                                                        >
                                                            {trade.dir}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">${formatCryptoPrice(trade.px)}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            {trade.sz} {trade.coin}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            ${formatCryptoPrice(parseFloat(trade.px) * parseFloat(trade.sz), 2, 2)}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">${formatCryptoPrice(trade.fee)}</td>
                                                        <td
                                                            className={`py-3 px-4 text-center ${
                                                                Number(trade.closedPnl) > 0 ? 'text-positive' : 'text-negative'
                                                            }`}
                                                        >
                                                            ${formatCryptoPrice(trade.closedPnl, 2, 2)}
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="text-center py-3">
                                                    <EmptyData text="No Trade History" />
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
                            {userFillsData && userFillsData.length > 0 ? (
                                userFillsData
                                    .sort((a, b) => b.time - a.time)
                                    .map((trade, index) => (
                                        <div key={index} className=" bg-table-even border-b border-border apply-transition relative py-2">
                                            <div className="flex items-center px-3 justify-between">
                                                <div className="flex flex-row items-center gap-1">
                                                    <div
                                                        className=" text-left text-sm font-bold"
                                                        onClick={() => {
                                                            setTokenId(trade.coin)
                                                        }}
                                                    >
                                                        {trade.coin}
                                                    </div>
                                                    <div
                                                        className={`px-1  rounded h-4 leading-4 flex flex-col text-[8px] ${
                                                            trade.side === 'B' ? 'text-positive bg-positive/20' : 'text-negative bg-negative/20'
                                                        }`}
                                                    >
                                                        {trade.dir}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-2xs text-neutral-text-dark">Closed PNL</span>
                                                    <span
                                                        className={`${
                                                            Number(trade.closedPnl) > 0 ? 'text-positive' : 'text-negative'
                                                        } text-sm font-bold`}
                                                    >
                                                        ${formatCryptoPrice(trade.closedPnl, 2, 2)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 pt-1">
                                                <div className="py-1 px-3 flex flex-col">
                                                    <span className="text-2xs text-neutral-text-dark">Price</span>
                                                    <div className="flex flex-col text-xs">${formatCryptoPrice(trade.px)}</div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1">
                                                    <span className="text-2xs text-neutral-text-dark">Size</span>
                                                    <div className="flex flex-col text-xs">
                                                        {trade.sz} {trade.coin}
                                                    </div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1">
                                                    <span className="text-2xs text-neutral-text-dark">Trade Value</span>
                                                    <div className="flex flex-col text-xs">
                                                        ${formatCryptoPrice(parseFloat(trade.px) * parseFloat(trade.sz), 2, 2)}
                                                    </div>
                                                </div>
                                                <div className="py-1 px-3 flex flex-col col-span-1 items-end">
                                                    <span className="text-2xs text-neutral-text-dark text-right">Fee</span>
                                                    <div className="flex flex-col text-xs text-right">${formatCryptoPrice(trade.fee)}</div>
                                                </div>

                                                <div className="py-1 px-3 flex flex-col col-span-1">
                                                    <span className="text-2xs text-neutral-text-dark">Time</span>
                                                    <div className="flex flex-col text-xs">{getReadableUnixTimestamp(trade.time, timezone)}</div>
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

export default TradeHistoryTable
