import React, { useState } from 'react'
import { GiElectric } from 'react-icons/gi'
import DecimalInput from './input/DecimalInput'
import { useUser } from '@/context/UserContext'

const QuickyBuyInput = () => {
    const { chain } = useUser()
    const localQuickBuyAmount = typeof window !== 'undefined' && localStorage.getItem('quickBuyAmount')
    const [quickBuyAmount, setQuickBuyAmount] = useState<string | undefined>(localQuickBuyAmount ? localQuickBuyAmount : undefined)

    return (
        <div className="relative overflow-hidden  flex items-center bg-table-odd rounded-lg border border-border">
            <div className="text-yellow-500 text-xs border-r border-border flex justify-center items-center px-2 gap-[2px] absolute inset-y-0 left-0">
                <GiElectric />
            </div>
            <DecimalInput
                onChange={e => {
                    setQuickBuyAmount(e.target.value)
                }}
                onBlur={() => {
                    if (quickBuyAmount === undefined) return
                    localStorage.setItem('quickBuyAmount', quickBuyAmount ? quickBuyAmount.toString() : '')
                }}
                value={quickBuyAmount ? quickBuyAmount?.toString() : ''}
                className=" text-right text-sm  font-semibold bg-table-odd focus:outline-none pl-9 pr-10  w-[6.7rem] md:w-[8rem] h-8 border-transparent  focus:bg-neutral-900 text-neutral-text "
                max={20}
                inputMode="text"
            />

            <div className=" text-neutral-text-dark z-10  font-semibold pr-2 pointer-events-none text-xs inset-y-0 right-0 flex absolute items-center justify-center">
                {chain.symbol}
            </div>
        </div>
    )
}

export default QuickyBuyInput
