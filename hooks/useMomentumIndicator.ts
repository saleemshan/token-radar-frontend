import { useEffect, useState } from 'react'

// Custom hook for calculating momentum/exhaustion score
export const useMomentumIndicator = (
    candleData: Array<{
        t: number
        o: string | number
        h: string | number
        l: string | number
        c: string | number
        v: string | number
    }>,
    newsTimestamp: number
) => {
    // === User Parameters 用户参数 ===
    const maxBars = 5 // Track only the last 5 bars
    const rvolThreshold = 3 // Minimum RVOL required to activate
    const rvolCap = 10 // Cap RVOL to reduce noise
    const pvRatioCap = 1.0 // Price/Volume ratio cap
    const MOMENTUM_MAX_TIME_MS = 60 * 60 * 1000 // Momentum only valid for 60 minutes after news

    // Create reference to the calculated state
    const [state, setState] = useState({
        exhaustionScore: null as number | null,
        barElapsed: 0,
        rvol: 0,
        rawRvol: 0,
        vwpd: 0,
        vwpdClose: 0,
        netVol: 0,
        highCheck: false,
        pvRatio: 0,
        barStart: null as number | null,
        maxBars, // Export maxBars in the state so we can use it in the component
        isValid: false, // Whether the momentum calculation is still valid (within time window)
    })

    // Check if we're within the valid time window for momentum calculations
    useEffect(() => {
        const currentTime = Date.now()
        const isWithinTimeWindow = currentTime < newsTimestamp + MOMENTUM_MAX_TIME_MS

        if (!isWithinTimeWindow) {
            // If beyond time window, set as invalid but keep any previous calculations visible
            setState(prev => ({
                ...prev,
                isValid: false,
            }))
            return
        }

        // Inside time window, set as valid
        setState(prev => ({
            ...prev,
            isValid: true,
        }))
    }, [newsTimestamp])

    // Calculate all metrics when candleData changes - only if within time window
    useEffect(() => {
        const currentTime = Date.now()
        const isWithinTimeWindow = currentTime < newsTimestamp + MOMENTUM_MAX_TIME_MS

        // If beyond time window, don't calculate
        if (!isWithinTimeWindow) {
            return
        }

        if (!candleData || !Array.isArray(candleData) || candleData.length === 0 || !newsTimestamp) {
            return
        }

        // Find the news candle index
        const newsIndex = candleData.findIndex(candle => candle.t >= newsTimestamp)
        if (newsIndex === -1 || newsIndex < 10) {
            // Not enough prior candles
            return
        }

        // Calculate the bar elapsed
        const barStart = newsIndex
        const barElapsed = Math.min(maxBars - 1, candleData.length - 1 - newsIndex)

        // Get relevant candles
        const currentCandle = candleData[newsIndex + barElapsed]

        // Calculate volume metrics
        const priorCandles = candleData.slice(newsIndex - 15, newsIndex)
        const smaVolume = priorCandles.reduce((sum, candle) => sum + parseFloat(candle.v.toString()), 0) / priorCandles.length
        const volume = parseFloat(currentCandle.v.toString())

        // OHLC data
        const open = parseFloat(currentCandle.o.toString())
        const high = parseFloat(currentCandle.h.toString())
        const low = parseFloat(currentCandle.l.toString())
        const close = parseFloat(currentCandle.c.toString())

        // First candle for comparison
        const firstCandle = candleData[newsIndex]
        const firstOpen = parseFloat(firstCandle.o.toString())

        // Calculate net volume (simple approximation based on price movement)
        const priceChange = close - open
        const netVol = priceChange > 0 ? volume : -volume

        // Check if high/close ratio is good (< 0.4)
        const highCloseRatio = (high - close) / (high - low + 1e-9)
        const highCheck = highCloseRatio < 0.4

        // Calculate raw metrics
        const rawRvol = volume / (smaVolume || 1) // Avoid div by 0
        const rvol = Math.min(rawRvol, rvolCap)
        const pctMove = ((close - firstOpen) / firstOpen) * 100
        const pvRatio = pctMove / (rvol || 1) // Avoid div by 0

        // Calculate vwpd metrics
        const vwpdRaw = pctMove * rawRvol
        const vwpdCloseRaw = ((close - open) / open) * 100 * rawRvol
        const vwpd = vwpdRaw * (rvol / (rawRvol || 1))
        const vwpdClose = vwpdCloseRaw * (rvol / (rawRvol || 1))

        // Calculate exhaustion score
        let exhaustionScore = null
        if (barElapsed < maxBars && rvol > rvolThreshold && pvRatio <= pvRatioCap) {
            exhaustionScore = 0

            if (vwpd > 10) exhaustionScore++ // VWPD high enough
            if (vwpdClose <= 0) exhaustionScore++ // VWPD close weak
            if (netVol < 0) exhaustionScore++ // Net selling
            if (barElapsed >= maxBars - 1 && !highCheck) exhaustionScore++ // Last bar, poor close
        }

        // Update state with all calculated values
        setState({
            exhaustionScore,
            barElapsed,
            rvol,
            rawRvol,
            vwpd,
            vwpdClose,
            netVol,
            highCheck,
            pvRatio,
            barStart,
            maxBars,
            isValid: true,
        })
    }, [candleData, newsTimestamp, maxBars, rvolThreshold, rvolCap, pvRatioCap])

    // Return all calculated metrics and exhaustion score
    return state
}
