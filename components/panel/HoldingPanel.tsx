import useTokenMyPositionsData from '@/hooks/data/useTokenMyPositionsData'
import React, { useRef } from 'react'
import TableRowLoading from '../TableRowLoading'
import { getTimeComparison } from '@/utils/time'
import { getUppercaseFirstLetter } from '@/utils/string'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import Link from 'next/link'
import { SiEthereum, SiSolana } from 'react-icons/si'
import PercentageChange from '../PercentageChange'
import TextLoading from '../TextLoading'
import { FaXmark } from 'react-icons/fa6'
import { chains } from '@/data/default/chains'
import useControlledScroll from '@/hooks/useControlledScroll'

const HoldingPanel = ({
    toggleHoldingPanel,
    chain,
    tokenAddress,
    userPublicWalletAddresses,
    symbol,
}: {
    userPublicWalletAddresses: UserPublicWalletAddresses
    chain: ChainId
    tokenAddress: string
    toggleHoldingPanel: () => void
    symbol: string
}) => {
    const { data, isLoading } = useTokenMyPositionsData(chain, tokenAddress, userPublicWalletAddresses[chain])

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    const selectedChain = chains.find(_chain => _chain.id === chain)

    return (
        <div
            className="z-[49] bg-black/50 inset-0 absolute flex justify-end max-h-full max-w-full overflow-hidden"
            onClick={e => {
                if (e.target === e.currentTarget) return toggleHoldingPanel()
            }}
        >
            <div className="w-full bg-black max-h-full overflow-hidden h-full">
                <div className="flex p-3 items-center justify-between border-b border-border">
                    <div className="text-base font-semibold leading-6 text-white ">{symbol} Transaction Detail</div>
                    <button
                        type="button"
                        onClick={() => {
                            toggleHoldingPanel()
                        }}
                        className=" ml-auto flex bg-neutral-900 rounded-lg w-8 h-8 items-center justify-center text-neutral-text apply-transition hover:bg-neutral-800 "
                    >
                        <FaXmark className="block " />
                    </button>
                </div>

                {/* analytics  */}
                <div className="">
                    <div className="grid grid-cols-3 lg:grid-cols-6 py-2">
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Balance (USD)</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <div className=" text-sm text-neutral-text ">{getReadableNumber(data?.analytics?.balance_usd, 2, '$', true)}</div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Unrealized</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <>
                                        <div
                                            className={`text-sm ${
                                                data?.analytics?.unrealized_pnl_usd
                                                    ? data?.analytics?.unrealized_pnl_usd > 0
                                                        ? 'text-positive'
                                                        : data?.analytics?.unrealized_pnl_usd < 0
                                                        ? 'text-negative'
                                                        : 'text-neutral-text'
                                                    : 'text-neutral-text'
                                            }`}
                                        >
                                            {getReadableNumber(data?.analytics?.unrealized_pnl_usd, 2, '$', true)}
                                        </div>

                                        <PercentageChange padding="" size="small" percentage={data?.analytics?.unrealized_pnl_percentage ?? 0} />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Realized</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <>
                                        <div
                                            className={`text-sm ${
                                                data?.analytics?.realized_pnl_usd
                                                    ? data?.analytics?.realized_pnl_usd > 0
                                                        ? 'text-positive'
                                                        : data?.analytics?.realized_pnl_usd < 0
                                                        ? 'text-negative'
                                                        : 'text-neutral-text'
                                                    : 'text-neutral-text'
                                            }`}
                                        >
                                            {getReadableNumber(data?.analytics?.realized_pnl_usd, 2, '$', true)}
                                        </div>

                                        <PercentageChange padding="" size="small" percentage={data?.analytics?.realized_pnl_percentage ?? 0} />
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Bought/Average</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <>
                                        <div className=" text-sm text-neutral-text">
                                            {getReadableNumber(data?.analytics?.bought_usd, undefined, '$')}
                                        </div>
                                        <div className="text-xs">
                                            {getReadableNumber(
                                                data?.analytics?.bought_average_price,
                                                countDecimalPlaces(data?.analytics?.bought_average_price ?? 0, 2, 2),
                                                '$'
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Sold/Average</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <>
                                        <div className=" text-sm text-neutral-text">{getReadableNumber(data?.analytics?.sold_usd, 2, '$')}</div>
                                        <div className="text-xs">
                                            {getReadableNumber(
                                                data?.analytics?.sold_average_price,
                                                countDecimalPlaces(data?.analytics?.sold_average_price ?? 0, 2, 2),
                                                '$'
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center p-2">
                            <div className=" text-neutral-text-dark text-xs ">Total Profit</div>
                            <div className="flex flex-col items-center justify-center h-10">
                                {isLoading ? (
                                    <TextLoading />
                                ) : (
                                    <>
                                        <div
                                            className={`text-sm ${
                                                data?.analytics?.total_profit_usd
                                                    ? data?.analytics?.total_profit_usd > 0
                                                        ? 'text-positive'
                                                        : data?.analytics?.total_profit_usd < 0
                                                        ? 'text-negative'
                                                        : 'text-neutral-text'
                                                    : 'text-neutral-text'
                                            }`}
                                        >
                                            {getReadableNumber(data?.analytics?.total_profit_usd, 2, '$', true)}
                                        </div>

                                        <PercentageChange padding="" size="small" percentage={data?.analytics?.total_profit_percentage ?? 0} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* positions  */}
                <div
                    ref={tableContainerRef}
                    className="  overflow-x-auto mobile-no-scrollbar overflow-y-auto max-h-full border-t border-border pb-[13.5rem] md:pb-[9rem]"
                >
                    <table className=" table-auto w-full max-h-full">
                        <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                            <tr className="w-full text-neutral-text-dark relative">
                                <th className="py-3 text-xs px-4 text-nowrap">
                                    Time <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                                </th>
                                <th className="py-3 text-xs px-4 text-nowrap">Type</th>
                                <th className="py-3 text-xs px-4 text-nowrap">Total USD</th>
                                <th className="py-3 text-xs px-4 text-nowrap">Amount</th>
                                <th className="py-3 text-xs px-4 text-nowrap">Price</th>
                                {/* <th className="py-3 text-xs px-4 text-nowrap">Maker</th> */}
                                <th className="py-3 text-xs px-4 text-nowrap">Txn</th>
                            </tr>
                        </thead>
                        {isLoading ? (
                            <TableRowLoading totalTableData={6} totalRow={15} className="px-2" />
                        ) : (
                            <tbody className="w-full text-xs">
                                {data &&
                                    data.transactions.length > 0 &&
                                    data.transactions.map((transaction, index) => {
                                        return (
                                            <tr
                                                key={index}
                                                className="hover:bg-table-odd bg-table-even cursor-pointer border-b border-border/80 apply-transition relative"
                                            >
                                                <td className="text-center   relative py-3 h-12">
                                                    {getTimeComparison(transaction.executed_at)}
                                                    <div
                                                        className={`absolute inset-y-0 left-0  w-1 ${
                                                            transaction.type === 'buy' ? 'bg-positive' : 'bg-negative'
                                                        }`}
                                                    ></div>
                                                </td>
                                                <td className={` text-center h-12 ${transaction.type === 'buy' ? 'text-positive' : 'text-negative'}`}>
                                                    {getUppercaseFirstLetter(transaction.type)}
                                                </td>
                                                <td className="text-center h-12  ">{getReadableNumber(transaction.total_usd, 2, '$')}</td>
                                                <td className="text-center h-12  "> {getReadableNumber(transaction.amount, 3)}</td>
                                                <td className="text-center h-12  ">
                                                    {getReadableNumber(+transaction.price_usd, countDecimalPlaces(transaction.price_usd, 2, 2), '$')}
                                                </td>
                                                {/* <td className="text-center  ">
                             {getSlicedAddress(transaction.maker, 3, '-')}
                           </td> */}
                                                <td className="h-12">
                                                    <div className="flex items-center justify-center">
                                                        {selectedChain && (
                                                            <Link
                                                                target="_blank"
                                                                href={`${selectedChain.explorer.tx}/${transaction.transaction_hash}`}
                                                            >
                                                                {chain === 'solana' && <SiSolana className="text-xs" />}
                                                                {chain === 'ethereum' && <SiEthereum className="text-xs" />}
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default HoldingPanel
