'use client'

import { NEWS_TRADING_DEFAULT_BIG_AMOUNT, NEWS_TRADING_DEFAULT_SMALL_AMOUNT } from '@/data/default/tradeSettings'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface NewsTradingContextProps {
    leverage: number
    newsTradingPreset: {
        longBig: number
        longSmall: number
        shortBig: number
        shortSmall: number
    }
    newsFeedFetched: boolean
    setNewsFeedFetched: (newsFeedFetched: boolean) => void
}

const NewsTradingContext = createContext({} as NewsTradingContextProps)

export const useNewsTradingContext = () => {
    const context = useContext(NewsTradingContext)
    if (!context) {
        throw new Error('context must be used within a NewsTradingProvider')
    }
    return context
}

const NewsTradingProvider = ({ children }: { children: ReactNode }) => {
    const [newsFeedFetched, setNewsFeedFetched] = useState(false)
    const [leverage, setLeverage] = useState(1)

    const [newsTradingPreset, setNewsTradingPreset] = useState({
        longBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
        longSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
        shortBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
        shortSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
    })

    const updateAmounts = () => {
        const preset = localStorage.getItem('newsTradingPreset')
        const parsedPreset = JSON.parse(preset ?? '{}')

        setLeverage(parsedPreset?.leverage ?? 1)

        setNewsTradingPreset(
            preset
                ? {
                      longBig: parsedPreset?.longBig,
                      longSmall: parsedPreset?.longSmall,
                      shortBig: parsedPreset?.shortBig,
                      shortSmall: parsedPreset?.shortSmall,
                  }
                : {
                      longBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
                      longSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
                      shortBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
                      shortSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
                  }
        )
    }

    useEffect(() => {
        updateAmounts()
        window.addEventListener('newsTradingPresetsUpdated', updateAmounts)
        return () => {
            window.removeEventListener('newsTradingPresetsUpdated', updateAmounts)
        }
    }, [])

    return (
        <NewsTradingContext.Provider value={{ leverage, newsTradingPreset, newsFeedFetched, setNewsFeedFetched }}>
            {children}
        </NewsTradingContext.Provider>
    )
}

export default NewsTradingProvider
