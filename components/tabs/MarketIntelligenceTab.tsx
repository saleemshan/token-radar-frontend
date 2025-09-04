import { useUser } from '@/context/UserContext'
import useTokenMarketIntelligenceData from '@/hooks/data/useTokenMarketIntelligenceData'
import { getReadableNumber } from '@/utils/price'
import { getTimeComparison } from '@/utils/time'
import React, { useRef } from 'react'
import TableRowLoading from '../TableRowLoading'
import useControlledScroll from '@/hooks/useControlledScroll'
import ImageFallback from '../ImageFallback'
import EmptyData from '../global/EmptyData'

const MarketIntelligenceTab = ({ tokenAddress }: { tokenAddress: string }) => {
    const { chain } = useUser()
    const { data, isLoading } = useTokenMarketIntelligenceData(chain.api, tokenAddress)

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    return (
        <div className=" min-h-[60vh] max-h-[60vh] overflow-x-auto " ref={tableContainerRef}>
            <table className=" table-auto w-full h-full">
                <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                    <tr className="w-full text-neutral-text-dark relative">
                        <th className="py-3 text-xs text-left px-2 text-nowrap">
                            Group <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                        </th>
                        <th className="py-3 text-xs px-2 text-nowrap">Time</th>
                        <th className="py-3 text-xs px-2 text-nowrap">Call MCAP</th>
                        {/* <th className="py-3 text-xs px-2 text-nowrap">Current MCAP</th> */}
                    </tr>
                </thead>
                {isLoading ? (
                    <TableRowLoading totalTableData={3} totalRow={15} className="px-2" />
                ) : (
                    <tbody className="w-full text-xs">
                        {data &&
                            data.length > 0 &&
                            data.map(data => {
                                return (
                                    <tr
                                        key={data.id}
                                        className="hover:bg-table-odd bg-table-even border-b border-border/80 apply-transition relative"
                                    >
                                        <td className="text-left h-12 min-w-36">
                                            <div className=" flex items-center justify-start gap-2  h-full pl-2">
                                                {/* <span className="w-5 h-5 rounded-full bg-primary"></span>
                                                 */}
                                                <div
                                                    className={`bg-black  rounded-full border border-border overflow-hidden relative flex items-center justify-center  min-w-8 min-h-8 max-w-8 max-h-8`}
                                                >
                                                    <ImageFallback
                                                        src={data?.image?.icon}
                                                        alt={`${data.name} logo`}
                                                        width={100}
                                                        height={100}
                                                        className=""
                                                        type="market-intelligence"
                                                    />
                                                </div>
                                                <span> {data.name}</span>
                                            </div>
                                        </td>
                                        <td className="text-center ">{getTimeComparison(data.called_at)} ago</td>

                                        <td className="text-center  ">{getReadableNumber(data.called_market_cap, undefined, '$')}</td>
                                        {/* <td className="text-center   ">
                      <div className="flex flex-col items-center justify-center h-full">
                        <div>
                          {' '}
                          {getReadableNumber(
                            data.current_market_cap,
                            undefined,
                            '$',
                          )}
                        </div>
                        <div
                          className={`text-xs ${
                            getPercentageChange(
                              data.called_market_cap,
                              data.current_market_cap,
                            ) > 0
                              ? 'text-positive'
                              : getPercentageChange(
                                  data.called_market_cap,
                                  data.current_market_cap,
                                ) < 0
                              ? 'text-negative'
                              : 'text-neutral-text'
                          }`}
                        >
                          {getPercentageChange(
                            data.called_market_cap,
                            data.current_market_cap,
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </td> */}
                                    </tr>
                                )
                            })}

                        {!data && (
                            <tr>
                                <td className="p-2" colSpan={3}>
                                    <EmptyData />
                                </td>
                            </tr>
                        )}
                    </tbody>
                )}
            </table>
        </div>
    )
}

export default MarketIntelligenceTab
