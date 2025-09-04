import React, { useRef } from 'react'
// import { holdersResponse } from '@/data/dummy/holders';
import { getSlicedAddress } from '@/utils/crypto'
import { getReadableNumber } from '@/utils/price'
// import { getTimeComparison } from '@/utils/time';
// import PercentageChange from '../PercentageChange';

import TableRowLoading from '../TableRowLoading'
import useTokenHoldersData from '@/hooks/data/useTokenHoldersData'
import { useUser } from '@/context/UserContext'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
// import { Pie } from 'react-chartjs-2';
// import IconLabel from '../IconLabel';
import useTokenHoldersNoteworthyData from '@/hooks/data/useTokenHoldersNoteworthyData'
import useControlledScroll from '@/hooks/useControlledScroll'
import TokenBubblemaps from '@/components/graph/TokenBubblemaps'
import EmptyData from '../global/EmptyData'

ChartJS.register(ArcElement, Tooltip, Legend)

const HoldersTab = ({ tokenAddress, tokenData }: { tokenAddress: string; tokenData: Token | undefined }) => {
    const { chain } = useUser()
    const { data, isLoading } = useTokenHoldersData(chain.api, tokenAddress)
    const { data: noteworthyData, isLoading: noteworthyDataIsLoading } = useTokenHoldersNoteworthyData(chain.api, tokenAddress)

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    // const [mergedData, setMergedData] = useState<TokenHolder[]>([]);

    // useEffect(() => {
    // if (data && data.holders && data.holders.length > 0) {
    //   setMergedData(data?.holders);
    // }

    // if (
    //   data &&
    //   data.holders &&
    //   data.holders.length > 0 &&
    //   noteworthyData &&
    //   noteworthyData.noteworthy_holders &&
    //   noteworthyData.noteworthy_holders.length > 0
    // ) {
    //   const mergedData = data.holders.map((holder) => {
    //     const noteworthyDataAddress = noteworthyData.noteworthy_holders.find(
    //       (noteworthyHolder) =>
    //         noteworthyHolder.wallet_address === holder.address,
    //     );
    //     return {
    //       ...holder,
    //       noteworthy: noteworthyDataAddress,
    //     };
    //   });

    // }
    // console.log(noteworthyData);
    // }, [data, noteworthyData]);

    const getCommonHoldings = (address: string) => {
        if (!noteworthyData || !noteworthyData.noteworthy_holders || noteworthyData.noteworthy_holders.length <= 0) return

        const commonHoldings = noteworthyData.noteworthy_holders.find(holder => holder.wallet_address === address)

        const commonHoldingJSX =
            commonHoldings &&
            commonHoldings.holdings.map((data, index) => {
                return (
                    <div key={index} className=" bg-neutral-800 px-[6px] py-[2px] rounded-md whitespace-nowrap text-[12px]">
                        {data.token_name} {data.value_usd}
                    </div>
                )
            })

        return commonHoldingJSX
    }

    return (
        <div className="flex-1  overflow-hidden p-3 flex flex-col xl:flex-row gap-3">
            <div className="flex flex-col w-full flex-1 gap-3 overflow-hidden min-h-full">
                <div className="flex flex-col border border-border rounded-lg flex-1 overflow-hidden max-h-[40vh] min-h-[40vh] xl:min-h-[60vh] xl:max-h-[60vh]">
                    {/* <div className="flex gap-3 flex-wrap p-3 border-b border-border items-center justify-between">
            <div className=" font-semibold">Addresses</div>
          </div> */}
                    <div className="h-fit max-h-full overflow-y-auto mobile-no-scrollbar" ref={tableContainerRef}>
                        <table className=" table-auto w-full h-full relative">
                            <thead className="w-full uppercase bg-black text-sm ">
                                <tr className="w-full text-neutral-text-dark  sticky top-0 z-20 bg-black">
                                    <th className="py-3 text-xs px-2 text-left">
                                        Address
                                        <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                                    </th>
                                    <th className="py-3 text-xs px-2 text-left">Owned</th>
                                    <th className="py-3 text-xs px-2 text-left">Balance</th>
                                    <th className="py-3 text-xs px-2 text-left max-w-full whitespace-nowrap">Common Holdings</th>
                                </tr>
                            </thead>
                            {isLoading ? (
                                <TableRowLoading totalRow={15} totalTableData={4} className="px-2" />
                            ) : (
                                <tbody className="w-full text-xs">
                                    {data && data.holders && data.holders.length > 0 ? (
                                        data.holders.map((holder, index) => {
                                            return (
                                                <tr
                                                    key={`${holder.address}${index}`}
                                                    className={` cursor-pointer border-b  border-border/50 apply-transition relative bg-table-even hover:bg-table-odd`}
                                                >
                                                    <td className="text-left px-2  py-3">
                                                        <div className="flex items-center gap-1">
                                                            <span className=" min-w-fit whitespace-nowrap ">
                                                                {getSlicedAddress(holder.address, 3, '-')}{' '}
                                                            </span>
                                                            {/* <div className="flex items-center">
                                                        {holder.tags &&
                                                          holder.tags.length > 0 &&
                                                          holder.tags.map((tag, index) => {
                                                            return (
                                                              <IconLabel
                                                                key={`${tag}-${index}`}
                                                                type={tag}
                                                              />
                                                            );
                                                          })}
                                                      </div> */}
                                                        </div>
                                                    </td>

                                                    <td className="text-left px-2">
                                                        <div className="flex items-center gap-2">
                                                            <span>{getReadableNumber(holder.balance)}</span>
                                                            <span className="py-[2px] px-1 text-2xs bg-blue-600/20 text-blue-500 rounded-md">
                                                                {(holder.owned_percentage * 100).toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="text-left px-2">
                                                        <div className="flex items-center gap-2">
                                                            <span>{getReadableNumber(+holder.owned_usd, 2, '$')}</span>
                                                        </div>
                                                    </td>

                                                    <td className=" max-w-36  overflow-x-auto no-scrollbar">
                                                        <div className="flex items-center ">
                                                            {noteworthyDataIsLoading ? (
                                                                <span className="px-2">-</span>
                                                            ) : (
                                                                <div className="flex items-center gap-1 text-xs px-2">
                                                                    {getCommonHoldings(holder.address)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td className="p-2" colSpan={4}>
                                                <EmptyData />
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            )}
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex flex-col overflow-hidden max-h-[70vh] min-h-[70vh] xl:min-h-[60vh] xl:max-h-[60vh] xl:w-[50%] gap-3  h-full">
                <div className="flex flex-col border border-border justify-center items-center rounded-lg flex-1  overflow-hidden ">
                    <div className="  leading-6 p-2 border-b border-border w-full text-left min-h-fit font-semibold text-neutral-text-dark">
                        Holder Distribution Chart
                    </div>
                    <div className="flex flex-1 flex-col justify-center items-center h-full  overflow-y-auto mobile-no-scrollbar max-h-full w-full">
                        {tokenData && <TokenBubblemaps tokenData={tokenData} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HoldersTab
