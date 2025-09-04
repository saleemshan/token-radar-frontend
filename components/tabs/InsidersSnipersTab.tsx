import React, { useState } from 'react'
import { FaCircleInfo } from 'react-icons/fa6'
import Tooltip from '../Tooltip'
import PositionSquare from '../../archived/PositionSquare'
import { useUser } from '@/context/UserContext'

import TextLoading from '../TextLoading'
import InsidersAnalyticsTable from '@/components/tabs/InsidersAnalyticsTable'
import useTokenSnipersData from '@/hooks/data/useTokenSnipersData'
import clsx from 'clsx'
import useTokenDevInfoData from '@/hooks/data/useTokenDevInfoData'
import useTokenInsiderAnalysisData from '@/hooks/data/useTokenInsiderAnalysisData'
import { getInsiderColor } from '@/utils/textColor'
import EmptyData from '../global/EmptyData'

type Tab = 'Insiders' | 'Snipers'

const tabs: { label: Tab; tooltip: string }[] = [
    {
        label: 'Insiders',
        tooltip:
            'This includes the deployer or developer themselves and any insiders, insiders are defined as users who got transferred free tokens by the deployer or developer wallets',
    },
    {
        label: 'Snipers',
        tooltip: 'This tab displays the first 70 snipers of the token',
    },
]
const InsidersTab = ({ tokenAddress }: { tokenAddress: string }) => {
    const { chain } = useUser()
    const [activeTab, setActiveTab] = useState<Tab>('Insiders')

    const { isLoading: tokenDevInfoIsLoading } = useTokenDevInfoData(chain.api, tokenAddress)

    const { data: insiderAnalysisData } = useTokenInsiderAnalysisData(chain.api, tokenAddress)

    const { data: snipersData, isFetching } = useTokenSnipersData(chain.api, tokenAddress)

    const sniperHoldingRate = parseFloat(snipersData?.statusNow?.holding_rate ?? '0') * 100

    return (
        <div className="flex-1  xl:max-h-[60vh] min-h-full xl:min-h-[60vh] overflow-hidden p-3">
            <div className="flex gap-2 mb-3">
                {tabs.map(tab => {
                    return (
                        <div key={tab.label} className="flex items-center gap-1">
                            <button
                                onClick={() => {
                                    setActiveTab(tab.label)
                                }}
                                className={clsx(
                                    'flex text-nowrap items-center justify-center gap-1 text-xs py-1 hover:bg-neutral-800 duration-200 transition-all px-2 rounded-md font-semibold',
                                    activeTab === tab.label ? 'bg-neutral-800 text-neutral-text' : 'bg-neutral-900 text-neutral-text-dark',
                                    tab.label === 'Insiders' &&
                                        insiderAnalysisData &&
                                        !tokenDevInfoIsLoading &&
                                        getInsiderColor(Number(insiderAnalysisData?.graph_data?.holding_percentage ?? '0')),
                                    tab.label === 'Snipers' &&
                                        snipersData &&
                                        !isFetching &&
                                        getInsiderColor(Number(snipersData.statusNow?.holding_rate ?? '0'))
                                )}
                            >
                                {tab.label}
                                <Tooltip text={tab.tooltip}>
                                    <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                </Tooltip>
                            </button>
                        </div>
                    )
                })}
            </div>
            {activeTab === 'Insiders' && (
                <div className="flex flex-col w-full flex-1 gap-3 overflow-hidden min-h-full">
                    <div className="flex flex-col border border-border rounded-lg flex-1 overflow-hidden max-h-[40vh] min-h-[40vh] xl:min-h-full xl:max-h-full">
                        <div className="h-full overflow-y-auto">
                            <InsidersAnalyticsTable tokenAddress={tokenAddress} />
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'Snipers' && (
                <div className="flex flex-col overflow-hidden min-h-[40vh] xl:min-h-max xl:max-h-max gap-3">
                    <div className="flex flex-col border border-border rounded-lg flex-1 overflow-hidden  min-h-[40vh]  xl:min-h-full xl:max-h-full">
                        <div className="min-h-full overflow-y-auto mobile-no-scrollbar p-3 flex flex-col gap-3">
                            <div className="flex flex-col w-full">
                                <div className="flex flex-col md:flex-row gap-6 flex-wrap">
                                    <div className="flex flex-col gap-3 w-full md:w-3/5 min-w-[270px] max-w-[600px]">
                                        <div className="flex gap-3 flex-col">
                                            <div className="grid grid-cols-10 gap-2 w-full  flex-1 ">
                                                {isFetching ? (
                                                    <>
                                                        {[...Array(70)].map((_, index) => (
                                                            <div key={index} className="aspect-square rounded-[6px] animate-pulse bg-border" />
                                                        ))}
                                                    </>
                                                ) : snipersData?.holderInfo && snipersData?.holderInfo.length > 0 ? (
                                                    snipersData.holderInfo.map((holder, index) => {
                                                        return (
                                                            <PositionSquare
                                                                width={24}
                                                                height={24}
                                                                position={holder.status ?? 'sold'}
                                                                address={holder.wallet_address}
                                                                type="sniper"
                                                                key={`${holder.wallet_address}${index}`}
                                                            />
                                                        )
                                                    })
                                                ) : (
                                                    <div className=" flex flex-col w-full col-span-10">
                                                        <EmptyData />
                                                    </div>
                                                )}
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
                                            <div className="  p-2 border-r border-border">%Bought</div>
                                            <div className=" p-2">
                                                {snipersData ? (
                                                    `${(parseFloat(snipersData?.statusNow?.bought_rate ?? '0') * 100).toFixed(2)}%`
                                                ) : (
                                                    <TextLoading />
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 ">
                                            <div className=" p-2 border-r border-border">%Holding</div>
                                            <div className=" p-2">{snipersData ? `${sniperHoldingRate.toFixed(2)}%` : <TextLoading />}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InsidersTab
