'use client'
import React, { useEffect, useRef, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { FaFilter, FaMagnifyingGlass } from 'react-icons/fa6'
import { IoIosRocket } from 'react-icons/io'

import { usePairTokensContext } from '@/context/pairTokensContext'
import { useNewsTradingContext } from '@/context/NewsTradingContext'
import { useUserNotificationPreferencesData } from '@/hooks/data/useUserNotificationPreferencesData'

import Button from '../ui/Button'
import Tooltip from '../Tooltip'
import { ModalMethods } from '../modal/Modal'
import NewsFeedPanel from './NewsFeedPanel'
import NewsSoundButton from '../forms/NewsSoundButton'
import MobilePositionModal from '../modal/MobilePositionModal'
import MobileNewsFeedChart from '../graph/MobileNewsFeedChart'
import NewsFeedPreferencesModal from '../modal/NewsFeedPreferencesModal'
import NewsTradingPresetModal from '../modal/NewsTradingPresetModal'

interface Props {
    showOnlyNewsFeedPanel: boolean
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NewsTradingSidePanel = ({ showOnlyNewsFeedPanel }: Props) => {
    const { ready, authenticated } = usePrivy()
    const { setTokenId, setIsSpotToken } = usePairTokensContext()
    const { leverage } = useNewsTradingContext()
    const { data: notificationPreferencesData } = useUserNotificationPreferencesData()

    const silentRef = useRef(notificationPreferencesData?.preferences?.silent)
    const newsFeedPrefeencesModalRef = useRef<ModalMethods>()
    const newsTradingPresetModalRef = useRef<ModalMethods>()
    // const newsFeedSettingsModalRef = useRef<ModalMethods>()
    const mobilePositionModalRef = useRef<ModalMethods>()

    const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>('BTC')
    const [showSearchInput, setShowSearchInput] = useState(false)

    useEffect(() => {
        if (selectedTokenId && setTokenId) {
            setTokenId(selectedTokenId)
            setIsSpotToken(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedTokenId])

    return (
        <div className=" flex flex-col gap-3 overflow-hidden w-full md:w-full  pointer-events-none">
            <div className=" w-full  min-h-full max-h-full flex flex-col  pointer-events-auto  border-border md:border-r  bg-black">
                <div className="flex items-center justify-between md:min-h-16  md:h-16 p-2 pb-2 md:pb-2 border-b border-border  w-full gap-2">
                    <div className="hidden md:block">News Feed</div>
                    {/* <div className="block md:hidden text-white text-lg md:text-xl font-bold leading-6">News Trading</div> */}

                    {/* <button
                        type="button"
                        onClick={() => {
                            toggleShowOnlyNewsFeedPanel()
                        }}
                        className={`hidden lg:flex  bg-table-odd border border-border rounded-lg ml-auto  px-1 gap-2 w-8 min-w-8 h-8  min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                    >
                        <IoBarChart className="text-xs" />
                    </button> */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            height="h-8"
                            className="text-2xs  whitespace-nowrap "
                            onClick={() => {
                                if (newsTradingPresetModalRef.current) {
                                    newsTradingPresetModalRef.current.toggleModal()
                                }
                            }}
                        >
                            <Tooltip text={`Your leverage is set to ${String(leverage) === 'max' ? 'max' : `${leverage}X`}`}>
                                <div className="flex items-center gap-1">
                                    <IoIosRocket className="text-sm" />
                                    <span className=" text-xs leading-none text-inherit md:whitespace-nowrap">{`${
                                        String(leverage) === 'max' ? 'max' : `${leverage}X`
                                    }`}</span>
                                </div>
                            </Tooltip>
                        </Button>

                        {ready && authenticated && (
                            <Button
                                height="h-8"
                                className="text-2xs lg:hidden whitespace-nowrap"
                                onClick={() => {
                                    mobilePositionModalRef.current?.openModal()
                                }}
                            >
                                My Position
                            </Button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                setShowSearchInput(!showSearchInput)
                            }}
                            className={`flex  bg-table-odd border border-border rounded-lg  px-1 gap-2 w-8 min-w-8 h-8  min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                        >
                            <FaMagnifyingGlass className="text-sm " />
                        </button>

                        {ready && authenticated && (
                            <>
                                <NewsSoundButton
                                    onSilentChange={silent => {
                                        silentRef.current = silent
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (newsFeedPrefeencesModalRef.current) newsFeedPrefeencesModalRef.current.toggleModal()
                                    }}
                                    className={`flex  bg-table-odd border border-border rounded-lg  px-1 gap-2 w-8 min-w-8 h-8  min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                                >
                                    <FaFilter className="text-xs" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div
                    className={`flex-1 max-h-full overflow-hidden flex md:border-r border-border flex-col divide-border`}
                    style={{ minWidth: '320px' }}
                >
                    <NewsFeedPanel
                        selectedTokenId={selectedTokenId}
                        setSelectedTokenId={setSelectedTokenId}
                        showOnlyNewsFeedPanel={showOnlyNewsFeedPanel}
                        showSearchInput={showSearchInput}
                        setShowSearchInput={setShowSearchInput}
                    />
                </div>

                <MobileNewsFeedChart />
            </div>
            <NewsFeedPreferencesModal ref={newsFeedPrefeencesModalRef} />
            <NewsTradingPresetModal ref={newsTradingPresetModalRef} />
            {ready && authenticated && <MobilePositionModal ref={mobilePositionModalRef} />}
        </div>
    )
}

export default NewsTradingSidePanel
