'use client'
import React, { useEffect, useState } from 'react'
import { FaCheckCircle } from 'react-icons/fa'
import { FaXmark } from 'react-icons/fa6'
import ImageFallback from '../components/ImageFallback'

const TradeLoadingScreen = ({
    handleCloseScreen,
    details,
    isTradeProcessing,
    isTradeSuccess,
}: {
    handleCloseScreen: () => void
    details: TradeDetails | undefined
    isTradeProcessing: boolean
    isTradeSuccess: boolean
}) => {
    const [userStats] = useState({
        currentLevel: 1,
        currentExp: 100,
        levelExperience: 1000,
    })

    const getProgressBarPercentage = (currentExp: number, totalExp: number) => {
        const progress = (currentExp / totalExp) * 100
        return `${progress}%`
    }

    // const handleSimulateAddExp = () => {
    //   setUserStats((prevState) => {
    //     return {
    //       currentLevel: 1,
    //       currentExp: prevState.currentExp + 150,
    //       levelExperience: 1000,
    //     };
    //   });
    // };

    useEffect(() => {
        if (!isTradeProcessing) {
        }
    }, [isTradeProcessing])

    return (
        <div className="z-[999999] fixed inset-0 bg-black  flex flex-col items-center justify-center">
            <div className="flex flex-col max-w-3xl w-full text-neutral-text relative z-10 gap-2 p-4 md:py-16 h-full justify-between">
                <div className="flex items-center gap-6 w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex gap-1 justify-between">
                            <div className="font-bold">{`Lvl ${userStats.currentLevel ?? '-'}`}</div>
                            <div className="text-neutral-text-dark">{`${userStats.levelExperience - userStats.currentExp} XP till next level`}</div>
                        </div>
                        <div className="h-2 bg-neutral-900 rounded-lg w-full flex p-[2px]">
                            <div
                                style={{
                                    width: getProgressBarPercentage(userStats.currentExp, userStats.levelExperience),
                                }}
                                className=" bg-primary h-full rounded-full transition-all duration-200"
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {isTradeProcessing ? (
                        <>
                            <div className="size-16 mb-2 overflow-hidden rounded-full border border-border">
                                <ImageFallback
                                    src={details?.toTokenImage ?? ''}
                                    alt={`influencers`}
                                    width={200}
                                    height={200}
                                    className=" w-full h-full object-cover object-center"
                                />
                            </div>
                            <div className=" font-montserrat text-3xl font-bold text-white">{`Trade Processing`}</div>
                            <div className="text-base">
                                Buying <b>{details?.toTokenSymbol}</b>
                            </div>
                            <div className="text-xs">{`Est +${details?.estimateReceive?.toFixed(2)} ${details?.toTokenSymbol}`}</div>
                            <div className="mt-2 h-12">&nbsp;</div>
                        </>
                    ) : (
                        <>
                            {isTradeSuccess ? (
                                <>
                                    <FaCheckCircle className=" size-16 mb-2" />
                                    <div className=" font-montserrat text-3xl font-bold text-white">{`Trade Success`}</div>
                                    <div className="text-base">
                                        Bought <b>{details?.toTokenSymbol}</b>
                                    </div>
                                    <div className="text-xs">{`Est +${details?.estimateReceive?.toFixed(2)} ${details?.toTokenSymbol}`}</div>
                                    <div className="mt-2 h-12">
                                        <div className="bg-neutral-900 text-neutral-dark-text text-sm rounded-lg px-2 py-1 inline-block">+25xp</div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <FaXmark className=" size-12" />
                                    <div className=" font-montserrat text-3xl font-bold text-white">{`Trade Fail`}</div>
                                    <div className="text-base">Bought {details?.toTokenSymbol}</div>
                                </>
                            )}
                        </>
                    )}
                </div>
                <div className="">
                    <button
                        type="button"
                        onClick={handleCloseScreen}
                        className="w-full px-2 py-2 h-14 bg-white/0 backdrop-blur-sm border rounded-lg overflow-hidden border-border"
                    >
                        Done
                    </button>
                </div>
            </div>
            <video
                src="/videos/gamified/background720.mp4"
                autoPlay
                loop
                muted
                className="w-full h-full object-cover object-center absolute inset-0 opacity-30"
            />
        </div>
    )
}

export default TradeLoadingScreen
