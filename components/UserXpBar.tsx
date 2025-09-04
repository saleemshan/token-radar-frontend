'use client'
import useUserReferralLevelData from '@/hooks/data/useReferralLevelData'
import { getNumberWithCommas } from '@/utils/price'

import React, { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'

const UserXpBar = ({ borderColor = '#191919', backgroundColor = '#101010' }: { borderColor?: string; backgroundColor?: string }) => {
    const { data: userReferralLevelData } = useUserReferralLevelData()

    const prevLevelRef = useRef<number | null>(null)

    useEffect(() => {
        if (userReferralLevelData?.level != null) {
            const prevLevel = prevLevelRef.current
            if (prevLevel !== null && userReferralLevelData.level > prevLevel) {
                toast.success(`Congratulations! You've just advanced a level. Your level is now ${userReferralLevelData.level}.`)
            }
            prevLevelRef.current = userReferralLevelData.level
        }
    }, [userReferralLevelData?.level])

    const getProgressBarPercentage = (currentExp: number, totalExp: number) => {
        const progress = (currentExp / totalExp) * 100
        return `${progress}%`
    }

    return (
        <div className="flex flex-col gap-1 w-full text-xs">
            <div className="flex gap-1 justify-between">
                <div className="font-bold">{`Lvl ${userReferralLevelData ? userReferralLevelData.level : '-'}`}</div>
                <div className="text-neutral-text-dark">{`${
                    userReferralLevelData && userReferralLevelData.expToNextLevel
                        ? getNumberWithCommas(userReferralLevelData.expToNextLevel, true)
                        : '-'
                } XP till next level`}</div>
            </div>
            <div
                className="h-3 border  rounded-lg w-full flex p-[2px] overflow-hidden"
                style={{
                    backgroundColor,
                    borderColor,
                }}
            >
                {userReferralLevelData && (
                    <div
                        style={{
                            width: getProgressBarPercentage(userReferralLevelData.currentExp, userReferralLevelData.nextLevelThreshold),
                        }}
                        className=" bg-primary h-full rounded-full transition-all duration-200"
                    ></div>
                )}
            </div>
        </div>
    )
}

export default UserXpBar
