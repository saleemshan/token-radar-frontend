'use client'

import { useLogin, usePrivy } from '@privy-io/react-auth'
import React, { useRef, useState } from 'react'

import clsx from 'clsx'
import BloombergPanel from './BloombergPanel'
import FastNewsPanel from './FastNewsPanel'
import TradFiSocialPanel from './TradFiSocialPanel'
import { FaCog } from 'react-icons/fa'
import TradFiSocialSettingsModal from '../modal/TradFiSocialSettingsModal'
import TradFiFastNewsSettingsModal from '../modal/TradFiFastNewsSettingsModal'
import TradFiItemSkeleton from './TradFiItemSkeleton'

const TradFiPanel = () => {
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()

    const tradFiSocialSettingsModal = useRef<{
        toggleModal: () => void
    }>(null)

    const tradFiFastNewsSettingsModal = useRef<{
        toggleModal: () => void
    }>(null)

    const tabs = [
        {
            name: 'Bloomberg',
            ref: undefined,
        },
        {
            name: 'Fast News',
            ref: tradFiFastNewsSettingsModal,
        },
        {
            name: 'Social',
            ref: tradFiSocialSettingsModal,
        },
    ]

    const [activeTab, setActiveTab] = useState(tabs[0])

    return (
        <div className="relative z-[101] w-full  min-h-full max-h-full flex flex-col  pointer-events-auto  border-border  bg-black overflow-hidden">
            <div className="text-sm w-full font-semibold leading-6 text-white md:min-h-12 md:max-h-12 flex items-center gap-2 p-3 border-b border-border justify-between">
                <div className=" items-center gap-2 flex w-full">
                    <div className="text-xs">TradFi</div>
                    {ready && authenticated && (
                        <span className=" flex  size-[6px] relative">
                            <span
                                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                                    [1].length > 0 ? 'bg-positive' : 'bg-blue-500'
                                }`}
                            ></span>
                            <span className={`relative inline-flex size-[6px] rounded-full ${[1].length > 0 ? 'bg-positive' : 'bg-blue-500'}`}></span>
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden h-full max-h-full relative">
                {ready ? (
                    <>
                        {authenticated ? (
                            <>
                                <div className=" flex flex-col w-full">
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar  border-border border-b p-2">
                                        {tabs.map(tab => {
                                            return (
                                                <button
                                                    key={tab.name}
                                                    onClick={() => {
                                                        setActiveTab(tab)
                                                    }}
                                                    className={clsx(
                                                        ' flex gap-1 text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  pl-2 pr-2 rounded-md font-semibold',
                                                        activeTab.name === tab.name
                                                            ? 'bg-neutral-900 text-neutral-text'
                                                            : 'bg-black text-neutral-text-dark/70'
                                                    )}
                                                >
                                                    <span> {tab.name}</span>

                                                    {tab.ref && ready && authenticated && (
                                                        <span
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                if (tab.ref.current) {
                                                                    tab.ref.current.toggleModal()
                                                                }
                                                            }}
                                                            className={`flex  rounded  px-[2px] gap-2 w-4 min-w-4 h-4  min-h-4  items-center justify-center  apply-transition  -mr-1`}
                                                        >
                                                            <FaCog className="text-2xs" />
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {activeTab.name === 'Bloomberg' && <BloombergPanel />}
                                {activeTab.name === 'Fast News' && <FastNewsPanel />}
                                {activeTab.name === 'Social' && <TradFiSocialPanel />}

                                <TradFiFastNewsSettingsModal ref={tradFiFastNewsSettingsModal} />
                                <TradFiSocialSettingsModal ref={tradFiSocialSettingsModal} />
                            </>
                        ) : (
                            <div className="flex-1 h-full flex items-center justify-center p-3 gap-1">
                                <button type="button" onClick={handleSignIn} className=" border-b border-white">
                                    Sign in
                                </button>
                                <span> to view the feed.</span>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="w-full flex flex-col flex-1 overflow-hidden gap-2 p-2">
                        {Array.from({ length: 20 }).map((_, idx) => (
                            <TradFiItemSkeleton key={idx} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default TradFiPanel
