import { useLogin, usePrivy } from '@privy-io/react-auth'
import React, { useState } from 'react'

import useIsMobile from '@/hooks/useIsMobile'
import { FaChevronRight, FaCircleInfo } from 'react-icons/fa6'
import PerpsStrategiesPanel from './PerpsStrategiesPanel'
import SpotStrategiesPanel from './SpotStrategiesPanel'
import Tooltip from '../Tooltip'
import XButton from '../ui/XButton'

const StrategiesPanel = ({ setShowStrategyPanel }: { setShowStrategyPanel: (show: boolean) => void }) => {
    const { authenticated, ready } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const isMobile = useIsMobile()

    const tabs = process.env.NEXT_PUBLIC_ENABLE_MEMECOINS === 'true' ? ['Perps', 'Spot'] : ['Perps']
    // const tabs = ['Perps', 'Spot']

    const [activeTab, setActiveTab] = useState(tabs[0])

    if (ready && authenticated && process.env.NEXT_PUBLIC_ENABLE_ATS === 'true') {
        return (
            <div
                onClick={e => {
                    if (e.target === e.currentTarget && !isMobile) {
                        // Execute your logic here when clicking directly on the element itself
                        setShowStrategyPanel(false)
                    }
                }}
                className="fixed inset-0 z-[200] bg-black/10 backdrop-blur-sm flex-1 overflow-hidden flex flex-col max-h-full "
            >
                <div className={`${isMobile ? 'w-full flex-col h-full' : 'fixed right-3 inset-y-3 rounded-lg  md:flex-row '} flex overflow-hidden `}>
                    {!isMobile && (
                        <button
                            type="button"
                            onClick={() => {
                                setShowStrategyPanel(false)
                                // setShowWithdrawForm(false)
                            }}
                            className=" w-14 h-full group bg-black hover:bg-table-odd apply-transition -mr-2 lg:hover:-mr-4  flex flex-col items-center justify-center border-border border overflow-hidden rounded-lg"
                        >
                            <FaChevronRight className="mr-2  lg:group-hover:mr-4 apply-transition group-hover:text-neutral-text text-neutral-text-dark" />
                        </button>
                    )}
                    <div
                        className={`flex flex-col h-full w-full md:w-[22rem]  bg-black overflow-hidden relative ${
                            isMobile ? '' : 'border border-border rounded-lg'
                        }`}
                    >
                        <div className=" w-full flex flex-col flex-1 overflow-hidden">
                            <div className="flex gap-3 items-center p-2 pb-0">
                                <div className="flex gap-2 items-center">
                                    <div className=" text-white text-base md:text-sm font-semibold leading-6 ">Strategies</div>
                                    <Tooltip
                                        text="Define a trading strategy that automatically executes trades based on keyword-matched news and market
                                        sentiment."
                                    >
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div>

                                <div className="flex overflow-x-auto no-scrollbar gap-1  border border-border rounded-lg  justify-end  p-1 md:w-fit ml-auto">
                                    {tabs.map(tab => {
                                        return (
                                            <button
                                                key={tab}
                                                onClick={() => {
                                                    setActiveTab(tab)
                                                }}
                                                className={` flex px-1 text-nowrap w-full md:w-fit items-center rounded-md justify-center text-xs py-1 md:h-8 md:min-h-8 hover:bg-neutral-900 duration-200 transition-all  min-w-[5.5rem]  font-semibold ${
                                                    activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                                }`}
                                            >
                                                {tab}
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="block md:hidden">
                                    <XButton onClick={() => setShowStrategyPanel(false)} />
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col">
                                {activeTab === 'Perps' && <PerpsStrategiesPanel showTabs={false} setShowStrategyPanel={setShowStrategyPanel} />}
                                {activeTab === 'Spot' && <SpotStrategiesPanel showTabs={false} setShowStrategyPanel={setShowStrategyPanel} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="flex w-full flex-col items-center justify-center p-3 flex-1 gap-3">
                <div>Sign in to view your strategies</div>
                <button type="button" className="border-b border-white" onClick={handleSignIn}>
                    Sign In
                </button>
            </div>
        )
    }
}

export default StrategiesPanel
