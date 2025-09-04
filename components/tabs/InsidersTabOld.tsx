import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import React, { useEffect, useState } from 'react'
import PositionSquare from '../../archived/PositionSquare'
import TableRowLoading from '../TableRowLoading'
import { getSlicedAddress } from '@/utils/crypto'
import useTokenInsidersData from '@/hooks/data/useTokenInsidersData'
import { useUser } from '@/context/UserContext'
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import useTokenDevInfoData from '@/hooks/data/useTokenDevInfoData'
import TextLoading from '../TextLoading'
import IconLabel from '../IconLabel'

ChartJS.register(ArcElement, ChartTooltip, Legend)

const InsidersTab = ({ tokenAddress }: { tokenAddress: string }) => {
    const { chain } = useUser()
    const { data, isLoading } = useTokenInsidersData(chain.api, tokenAddress)

    const { data: tokenDevInfoData } = useTokenDevInfoData(chain.api, tokenAddress)

    const addressesTabs = [
        {
            display: 'Top 50',
            value: 'top50',
        },
        { display: 'Dev', value: 'dev' },
    ]
    const [addressesActiveTab] = useState(addressesTabs[0].value)
    const [activeAddresses, setActiveAddresses] = useState<Insiders>([])

    const [firstFiftyHolders, setFirstFiftyHolders] = useState<Insiders>([])
    const [devWallet, setDevWallet] = useState<Insider>()

    useEffect(() => {
        if (!data || data.addresses.length <= 0) return

        const filteredActiveAddresses = data.addresses.filter(address => {
            if (addressesActiveTab.toLowerCase() === 'top50') {
                return address.first_fifty_holders
            } else if (addressesActiveTab.toLowerCase() === 'dev') {
                return address.type.toLowerCase() === 'developer'
            }
        })
        setActiveAddresses(filteredActiveAddresses)

        const devWallet = data.addresses.find(address => {
            return address.type.toLowerCase() === 'developer'
        })
        setDevWallet(devWallet)

        const firstFiftyHolders = data.addresses.filter(address => address.first_fifty_holders)
        setFirstFiftyHolders(firstFiftyHolders)
    }, [data, addressesActiveTab])

    return (
        <div className="flex-1  xl:max-h-[60vh] min-h-[60vh] overflow-hidden p-3 flex flex-col xl:flex-row gap-3">
            <div className="flex flex-col w-full flex-1 gap-3 overflow-hidden min-h-full">
                <div className="flex flex-col border border-border rounded-lg flex-1 overflow-hidden max-h-[40vh] min-h-[40vh] xl:min-h-full xl:max-h-full">
                    {/* <div className="flex gap-3 flex-wrap p-3 border-b border-border items-center justify-between">
            <div className="  flex gap-3 overflow-x-auto  sticky top-0 bg-black">
              {addressesTabs.map((tab) => {
                return (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setAddressesActiveTab(tab.value);
                    }}
                    className={` flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold  ${
                      addressesActiveTab === tab.value
                        ? 'bg-neutral-800 text-neutral-text'
                        : 'bg-neutral-900 text-neutral-text-dark'
                    }`}
                  >
                    {tab.display}
                  </button>
                );
              })}
            </div>
          </div> */}
                    <div className="h-full overflow-y-auto">
                        <table className=" table-auto w-full h-full relative">
                            <thead className="w-full uppercase bg-black text-sm ">
                                <tr className="w-full text-neutral-text-dark  sticky top-0 z-20 bg-black">
                                    <th className="py-3 text-xs px-2 text-left">
                                        Address
                                        <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                                    </th>
                                    <th className="py-3 text-xs px-2 text-left">Own</th>
                                </tr>
                            </thead>
                            {isLoading ? (
                                <TableRowLoading totalRow={15} totalTableData={2} className="px-2" />
                            ) : (
                                <tbody className="w-full text-xs">
                                    {activeAddresses.map((address, index) => {
                                        return (
                                            <tr
                                                key={`${address.address}${index}`}
                                                className="hover:bg-table-odd bg-table-even border-b border-border/80 apply-transition pointer-events-auto relative w-full"
                                            >
                                                <td className="text-left px-2 py-2 flex items-center gap-2">
                                                    <div>{getSlicedAddress(address.address, 4, '-')}</div>
                                                    <div className="text-white">
                                                        {address.type.toLowerCase() === 'sniper' && <IconLabel type="sniper" />}
                                                        {address.type.toLowerCase() === 'dev' && <IconLabel type="dev" />}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-2 text-left">
                                                    <div className="flex flex-col justify-start items-start">
                                                        {address.current_holding && address.current_holding > 0 ? (
                                                            <span>{getReadableNumber(address.current_holding, 2)}</span>
                                                        ) : (
                                                            'Sold'
                                                        )}
                                                        {/* <div className="">
                                  {address.owned_percentage * 100}%
                                </div>
                                <div className="text-xs mb-1 text-neutral-text-dark -mt-[2px]">
                                  {getReadableNumber(address.owned_usd, '$')}
                                </div> */}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            )}

                            {!isLoading && activeAddresses.length <= 0 && (
                                <tbody className="w-full text-xs">
                                    <tr className="p-2">
                                        <td>No data available.</td>
                                    </tr>
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex flex-col overflow-hidden min-h-[40vh] xl:min-h-max xl:max-h-max xl:w-[50%] gap-3">
                <div className="flex flex-col border border-border rounded-lg flex-1 overflow-hidden  min-h-[40vh]  xl:min-h-full xl:max-h-full">
                    <div className="min-h-full overflow-y-auto mobile-no-scrollbar p-3 flex flex-col gap-3">
                        {addressesActiveTab.toLowerCase() === 'top50' && (
                            <div className="flex flex-col gap-6  h-full">
                                <div className="flex flex-col gap-2">
                                    <div>Dev Info</div>

                                    {tokenDevInfoData?.analytics?.never_held ? (
                                        <div className="text-sm">No holdings.</div>
                                    ) : (
                                        <>
                                            <div className="flex-1 flex justify-between">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-neutral-text text-sm">
                                                        {tokenDevInfoData?.analytics?.current_holding_percentage !== undefined &&
                                                        tokenDevInfoData?.analytics?.current_holding_percentage !== null
                                                            ? `${(tokenDevInfoData.analytics.current_holding_percentage * 100).toFixed(0)}%`
                                                            : ''}
                                                    </span>
                                                    <span className="text-neutral-text-dark text-xs">Hold</span>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <div className="text-neutral-text-dark text-xs flex flex-col">Sold</div>
                                                    <span className="text-neutral-text text-sm">
                                                        {tokenDevInfoData?.analytics?.current_holding_percentage !== undefined &&
                                                        tokenDevInfoData?.analytics?.current_holding_percentage !== null
                                                            ? `${(100 - tokenDevInfoData.analytics.current_holding_percentage * 100).toFixed(0)}%`
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex  w-full rounded-full overflow-hidden">
                                                <div
                                                    className="flex flex-col bg-positive/80 min-h-1"
                                                    style={{
                                                        width: `${
                                                            tokenDevInfoData?.analytics?.current_holding_percentage !== undefined &&
                                                            tokenDevInfoData?.analytics?.current_holding_percentage !== null
                                                                ? tokenDevInfoData.analytics.current_holding_percentage * 100
                                                                : 50
                                                        }%`,
                                                    }}
                                                />
                                                <div
                                                    className="flex flex-col bg-negative/80 min-h-1"
                                                    style={{
                                                        width: `${
                                                            tokenDevInfoData?.analytics?.current_holding_percentage !== undefined &&
                                                            tokenDevInfoData?.analytics?.current_holding_percentage !== null
                                                                ? 100 - tokenDevInfoData.analytics.current_holding_percentage * 100
                                                                : 50
                                                        }%`,
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 border rounded-lg border-border py-3">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-xs mb-1 text-neutral-text-dark leading-none">Balance</div>
                                                    <div className="leading-none text-xs">
                                                        {tokenDevInfoData?.analytics?.balance !== undefined &&
                                                        tokenDevInfoData?.analytics?.balance !== null ? (
                                                            getReadableNumber(+tokenDevInfoData?.analytics?.balance, 2)
                                                        ) : (
                                                            <TextLoading />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-xs mb-1 text-neutral-text-dark leading-none">Cost/Token</div>
                                                    <div className="leading-none text-xs">
                                                        {tokenDevInfoData?.analytics?.bought_average_price !== undefined &&
                                                        tokenDevInfoData?.analytics?.bought_average_price !== null ? (
                                                            getReadableNumber(
                                                                +tokenDevInfoData?.analytics?.bought_average_price,
                                                                countDecimalPlaces(+tokenDevInfoData?.analytics?.bought_average_price),
                                                                '$'
                                                            )
                                                        ) : (
                                                            <TextLoading />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-xs mb-1 text-neutral-text-dark leading-none">Unrealized</div>
                                                    <div className="leading-none text-xs">
                                                        {tokenDevInfoData?.analytics?.unrealized_pnl_usd !== undefined &&
                                                        tokenDevInfoData?.analytics?.unrealized_pnl_usd !== null ? (
                                                            getReadableNumber(
                                                                +tokenDevInfoData?.analytics?.unrealized_pnl_usd,
                                                                countDecimalPlaces(+tokenDevInfoData?.analytics?.unrealized_pnl_usd),
                                                                '$'
                                                            )
                                                        ) : (
                                                            <TextLoading />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="text-xs mb-1 text-neutral-text-dark leading-none">Realized</div>
                                                    <div className="leading-none text-xs">
                                                        {tokenDevInfoData?.analytics?.realized_pnl_usd !== undefined &&
                                                        tokenDevInfoData?.analytics?.realized_pnl_usd !== null ? (
                                                            getReadableNumber(
                                                                +tokenDevInfoData?.analytics?.realized_pnl_usd,
                                                                countDecimalPlaces(+tokenDevInfoData?.analytics?.realized_pnl_usd),
                                                                '$'
                                                            )
                                                        ) : (
                                                            <TextLoading />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col w-full">
                                    <div className="mb-3">Holding Visualization</div>
                                    <div className="flex flex-col md:flex-row gap-6 flex-wrap">
                                        <div className="flex flex-col gap-3 w-full md:w-3/5 min-w-[270px] max-w-[600px]">
                                            <div className="flex gap-3 flex-col">
                                                <div className="grid grid-cols-10 gap-2 w-full  flex-1 ">
                                                    {firstFiftyHolders.length > 0 &&
                                                        firstFiftyHolders.map((holder, index) => {
                                                            return (
                                                                <PositionSquare
                                                                    width={16}
                                                                    height={16}
                                                                    position={holder.current_position}
                                                                    address={holder.address}
                                                                    type={holder.type}
                                                                    key={`${holder.address}${index}`}
                                                                />
                                                            )
                                                        })}
                                                </div>
                                                <div className="flex flex-wrap gap-3 flex-row w-fit">
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none   aspect-square rounded-[5px] bg-positive/20 border border-positive w-4 h-4"></div>
                                                        <div className="text-xs">Bought More</div>
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none   aspect-square rounded-[5px] bg-blue-500/20 border border-blue-500 w-4 h-4"></div>
                                                        <div className="text-xs">Hold</div>
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none   aspect-square rounded-[5px] border border-negative relative overflow-hidden w-4 h-4">
                                                            <div className=" pointer-events-none w-1/2 bg-negative/20 border-r border-negative h-full absolute inset-y-0 left-0"></div>
                                                        </div>
                                                        <div className="text-xs">Partially Sold</div>
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none   aspect-square rounded-[5px] bg-negative/20 border border-negative w-4 h-4"></div>
                                                        <div className="text-xs">Sold </div>
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none  aspect-square rounded-[5px] bg-yellow-400/20 border border-yellow-400 w-4 h-4"></div>
                                                        <div className="text-xs">Transferred</div>
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <div className=" pointer-events-none  aspect-square rounded-[5px] bg-neutral-400/20 border border-neutral-400 w-4 h-4"></div>
                                                        <div className="text-xs">No Holdings</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-full text-neutral-text min-w-[150px] md:w-2/5 flex-1 border border-border rounded-lg text-xs divide-y divide-border h-fit">
                                            <div className="grid grid-cols-2 ">
                                                <div className="  p-2 border-r border-border">Total Snipers</div>
                                                <div className=" p-2">{data ? data.analytics?.total_snipers : <TextLoading />}</div>
                                            </div>
                                            <div className="grid grid-cols-2 ">
                                                <div className="  p-2 border-r border-border">Total Insiders</div>
                                                <div className=" p-2">{data ? data.analytics?.total_insiders : <TextLoading />}</div>
                                            </div>
                                            <div className="grid grid-cols-2 ">
                                                <div className=" p-2 border-r border-border">Total Bought</div>
                                                <div className=" p-2">
                                                    {data ? <>{`${(data.analytics?.total_bought_percentage * 100).toFixed(2)}%`}</> : <TextLoading />}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 ">
                                                <div className=" p-2 border-r border-border">Top 10 Holders</div>
                                                <div className=" p-2">
                                                    {data ? (
                                                        <>{`${(data.analytics?.top_10_holders_percentage * 100).toFixed(2)}%`}</>
                                                    ) : (
                                                        <TextLoading />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 ">
                                                <div className=" p-2 border-r border-border">Current Total Holdings</div>
                                                <div className=" p-2">
                                                    {data ? (
                                                        <>{`${(data.analytics?.current_total_holdings_percentage * 100).toFixed(2)}%`}</>
                                                    ) : (
                                                        <TextLoading />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {addressesActiveTab.toLowerCase() === 'dev' && (
                            <>
                                {devWallet ? (
                                    <div className="flex gap-3">
                                        <div className="flex justify-center items-center w-2/3">
                                            <Pie
                                                data={{
                                                    labels: ['Sold', 'Buy', 'Hold'],
                                                    datasets: [
                                                        {
                                                            label: '# of X',
                                                            data: [12, 19, 3],
                                                            backgroundColor: [
                                                                'rgba(255,24,80, 0.2)',
                                                                'rgba(128, 255, 108, 0.2)',
                                                                'rgba(59, 130, 246, 0.2)',
                                                            ],
                                                            borderColor: ['rgba(255,24,80, 1)', 'rgba(128, 255, 108, 1)', 'rgba(59 ,130 ,246, 1)'],
                                                            borderWidth: 1,
                                                        },
                                                    ],
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col w-1/3 justify-center">
                                            <div>Hold: x %</div>
                                            <div>Buy: x %</div>
                                            <div>Sold: x %</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>No developer wallet found.</div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InsidersTab
