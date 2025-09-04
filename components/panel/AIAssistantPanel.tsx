'use client'
import { useUser } from '@/context/UserContext'
import React, { useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaLink, FaXmark } from 'react-icons/fa6'
import AIAssistantForm from '../forms/AIAssistantForm'
import Image from 'next/image'

const AIAssistantPanel = () => {
    const { toggleAIAssistant } = useUser()
    const [showPluginList, setShowPluginList] = useState(false)

    const plugins: AIAssistantPlugin[] = [
        {
            name: 'Jupiter',
            image: '/images/brand/jupiter.png',
        },
        {
            name: 'Birdeye',
            image: '/images/brand/birdeye.png',
        },
        {
            name: 'Coingecko',
            image: '/images/brand/coingecko.png',
        },
        {
            name: 'defillama',
            image: '/images/brand/defillama.png',
        },
        {
            name: 'Twitter',
            image: '/images/brand/twitter.png',
        },
        {
            name: 'Quickintel',
            image: '/images/brand/quickintel.png',
        },
        {
            name: 'RugCheck',
            image: '/images/brand/rugcheck.png',
        },
        {
            name: 'Defi Rug Check',
            image: '',
        },
        {
            name: 'Project Alpha (Propretiary)',
            image: '',
        },
        {
            name: 'Token Unlock',
            image: '/images/brand/tokenunlock.png',
        },
    ]

    const [selectedPlugin, setSelectedPlugin] = useState<undefined | AIAssistantPlugin>(undefined)

    if (!(process.env.NEXT_PUBLIC_ENABLE_AI_COMPANION === 'true')) return
    return (
        <div className={`h-full flex flex-col w-full overflow-hidden md:border md:border-border md:rounded-lg pointer-events-auto bg-black `}>
            <div className={`p-3 flex gap-3  border-border items-center md:border-b`}>
                <div className={`text-sm font-semibold leading-6 text-white flex-1 order-2 md:order-1 flex items-center justify-between`}>
                    <div>AI Assistant</div>

                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => {
                                setShowPluginList(!showPluginList)
                            }}
                            className="px-2 h-7 right-0 rounded-md border border-border  flex items-center justify-center text-neutral-text bg-neutral-900 hover:bg-neutral-800  apply-transition p-1 text-xs gap-1 uppercase"
                        >
                            <FaLink className="text-sm" />
                            <div className=" tracking-tighter">Plugins</div>
                        </button>
                        <button
                            onClick={toggleAIAssistant}
                            className="hidden lg:flex w-7 h-7 right-0 bg-neutral-900 rounded-md border border-border  items-center justify-center text-neutral-text hover:bg-neutral-800  apply-transition p-2"
                        >
                            <FaXmark className="text-xs" />
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={toggleAIAssistant}
                    className={`flex lg:hidden bg-neutral-900 rounded-lg w-8 h-8 items-center justify-center text-neutral-text apply-transition hover:bg-neutral-800 order-1 md:order-2`}
                >
                    <FaChevronLeft className="block md:hidden" />
                    <FaChevronRight className="hidden md:block" />
                </button>
            </div>

            <div className="relative flex-1 overflow-hidden flex flex-col">
                <AIAssistantForm selectedPlugin={selectedPlugin} />

                {showPluginList && (
                    <div className="flex flex-col flex-1 bg-black h-full w-full max-h-full overflow-hidden absolute inset-0 z-10">
                        <div className="p-3 border-b border-border font-semibold text-neutral-text-dark "> Plugin List</div>
                        <div className="flex-1 max-h-full overflow-y-auto p-3 ">
                            <div className="w-full grid grid-cols-3 gap-3">
                                {plugins.map(plugin => {
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPlugin(plugin)
                                                setShowPluginList(false)
                                            }}
                                            key={plugin.name}
                                            className="flex flex-col gap-2 p-3  border-border rounded-lg items-center aspect-square hover:bg-neutral-900 apply-transition"
                                        >
                                            {plugin.image ? (
                                                <Image
                                                    src={plugin.image}
                                                    className="w-full h-full object-center object-cover aspect-square rounded-md"
                                                    width={100}
                                                    height={100}
                                                    alt={`${plugin.name} logo`}
                                                />
                                            ) : (
                                                <div className="w-full h-full object-center object-cover aspect-square rounded-md bg-neutral-800 flex items-center justify-center">
                                                    <FaLink className="text-3xl"></FaLink>
                                                </div>
                                            )}
                                            <div className="text-sm font-medium text-center mt-auto">{plugin.name}</div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AIAssistantPanel
