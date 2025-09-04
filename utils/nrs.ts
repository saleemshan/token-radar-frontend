/**
 * News Reaction Signal (NRS) Utility Functions
 * Reusable functions for calculating trading signals based on price/volume reactions to news events
 */

// Constants for the NRS algorithm
export const NRS_CONFIG = {
    RVOL_THRESHOLD: 3, // RVOL threshold (3x)
    RVOL_CAP: 10, // RVOL maximum value (10x)
    PRICE_VOL_RATIO_CAP: 1.0, // Price/volume ratio upper limit
    NRS_MAX_TIME_MS: 6 * 60 * 1000, // NRS validity: 6 minutes after news
    MOMENTUM_MAX_TIME_MS: 60 * 60 * 1000, // Momentum validity: 60 minutes after news
}

// Type definitions
export interface CandleData {
    t: number
    o: string | number
    h: string | number
    l: string | number
    c: string | number
    v: string | number
}

export interface NRSResult {
    rvol: string
    rawRVOL: string
    pctMove: string
    priceVolRatio: string
    vwpdClose: string
    vwpdHigh: string
    vwpdDecay: string
    highCloseRatio: string
    signal: string
    action: 'buy' | 'fade' | 'watch' | 'ignore'
    isStale?: boolean
    isValid: boolean
}

/**
 * Calculate NRS signal from candle data
 * @param candleData Array of candle data
 * @param newsTimestamp News event timestamp in milliseconds
 * @returns NRS calculation result or null if invalid
 */
export function calculateNRS(candleData: CandleData[], newsTimestamp: number): NRSResult | null {
    // Don't calculate if outside valid time window
    const currentTime = Date.now()
    const isWithinTimeWindow = currentTime < newsTimestamp + NRS_CONFIG.NRS_MAX_TIME_MS

    if (!isWithinTimeWindow) {
        return null
    }

    if (!candleData || !Array.isArray(candleData) || candleData.length === 0) {
        return null
    }

    // Find news candle
    const newsIndex = candleData.findIndex(candle => candle.t >= newsTimestamp)
    if (newsIndex === -1 || newsIndex < 10) {
        // Not enough prior candles for comparison
        return null
    }

    // Extract the news candle and relevant data
    const newsCandle = candleData[newsIndex]
    const newsCandleTime = newsCandle.t
    const newsCandleCloseTime = newsCandleTime + 60 * 1000 // 1 minute after candle opens

    // Check if signal is stale (more than 30 minutes since candle closed)
    const isStale = currentTime > newsCandleCloseTime + 30 * 60 * 1000

    // Parse candle data
    const open = parseFloat(newsCandle.o.toString())
    const high = parseFloat(newsCandle.h.toString())
    const low = parseFloat(newsCandle.l.toString())
    const close = parseFloat(newsCandle.c.toString())
    const volume = parseFloat(newsCandle.v.toString())

    // Calculate average volume of the 10 prior candles for comparison
    const priorCandles = candleData.slice(newsIndex - 10, newsIndex)
    const avgVolume = priorCandles.reduce((sum, candle) => sum + parseFloat(candle.v.toString()), 0) / priorCandles.length

    // 1) Raw and capped relative volume
    const rawRVOL = volume / avgVolume
    const rvol = Math.min(rawRVOL, NRS_CONFIG.RVOL_CAP)

    // 2) Percent price move and price-vol ratio
    const pctMove = ((close - open) / open) * 100
    const priceVolRatio = pctMove / rvol

    // 3) VWPD metrics
    const vwpdClose = pctMove * rvol
    const vwpdHigh = ((high - open) / open) * 100 * rvol
    const vwpdDecay = vwpdHigh - vwpdClose

    // 4) Wick ratio
    const highCloseRatio = (high - close) / (high - low + 1e-9)

    // 5) Decision tree
    let signal = ''
    let action: 'buy' | 'fade' | 'watch' | 'ignore' = 'ignore'

    if (rvol > NRS_CONFIG.RVOL_THRESHOLD) {
        // A) Over-extended price-volume
        if (priceVolRatio > NRS_CONFIG.PRICE_VOL_RATIO_CAP) {
            signal = '⚠️ Over-extended (fade)'
            action = 'fade'
        } else if (vwpdClose > 20 && vwpdDecay > 20) {
            // B) Fake-out pump/dump
            signal = '⚠️ Spike-fade risk (fade)'
            action = 'fade'
        } else if (vwpdClose > 15 && highCloseRatio < 0.4) {
            // C) High-conviction breakout
            signal = '🔥 High conviction (buy)'
            action = 'buy'
        } else if (vwpdClose > 10 && vwpdDecay < 5) {
            // D) Sustained move
            signal = '✅ Sustained move (watch)'
            action = 'watch'
        } else if (vwpdClose < 5 && vwpdHigh > 20) {
            // E) Quick wick
            signal = '❌ Quick wick (fade)'
            action = 'fade'
        } else {
            // F) Low conviction
            signal = '🟡 Low conviction (ignore)'
            action = 'ignore'
        }
    } else {
        signal = '⚪ No unusual activity (ignore)'
        action = 'ignore'
    }

    return {
        rvol: rvol.toFixed(1),
        rawRVOL: rawRVOL.toFixed(1),
        pctMove: pctMove.toFixed(1),
        priceVolRatio: priceVolRatio.toFixed(2),
        vwpdClose: vwpdClose.toFixed(1),
        vwpdHigh: vwpdHigh.toFixed(1),
        vwpdDecay: vwpdDecay.toFixed(1),
        highCloseRatio: highCloseRatio.toFixed(2),
        signal,
        action,
        isStale,
        isValid: true,
    }
}

/**
 * Check if a timestamp is within the valid time window
 * @param timestamp News event timestamp in milliseconds
 * @param windowMs Time window in milliseconds
 * @returns Boolean indicating if the timestamp is still valid
 */
export function isWithinTimeWindow(timestamp: number, windowMs: number): boolean {
    const currentTime = Date.now()
    return currentTime < timestamp + windowMs
}

/**
 * Format the time remaining until expiry
 * @param timeStr Timestamp string
 * @param maxTimeMs Maximum time window in milliseconds
 * @returns Formatted time string
 */
export function formatTimeRemaining(timeStr: string, maxTimeMs: number): string {
    const publishTime = new Date(timeStr).getTime()
    const expiryTime = publishTime + maxTimeMs
    const now = Date.now()

    // If already expired
    if (now > expiryTime) {
        return 'Expired'
    }

    // Calculate minutes remaining
    const minutesRemaining = Math.floor((expiryTime - now) / 60000)
    return `${minutesRemaining}m`
}

/**
 * Get NRS timer information for display
 * @param newsTimestamp News event timestamp in milliseconds
 * @returns Timer state and display information
 */
export function getNRSTimerInfo(newsTimestamp: number): {
    phase: 'waiting' | 'active' | 'historical'
    currentMinute: number
    timeRemaining: string
    totalElapsed: number
} {
    const now = Date.now()
    const elapsedMs = now - newsTimestamp
    const elapsedMinutes = Math.floor(elapsedMs / (60 * 1000))

    // Before first minute - countdown to NRS start
    if (elapsedMs < 60 * 1000) {
        const secondsUntilM1 = Math.ceil((60 * 1000 - elapsedMs) / 1000)
        return {
            phase: 'waiting',
            currentMinute: 0,
            timeRemaining: `0:${secondsUntilM1.toString().padStart(2, '0')}`,
            totalElapsed: elapsedMinutes,
        }
    }

    // Active phase (M1-M6) - countdown to NRS end
    if (elapsedMs < NRS_CONFIG.NRS_MAX_TIME_MS) {
        const totalRemainingMs = NRS_CONFIG.NRS_MAX_TIME_MS - elapsedMs
        const remainingMinutes = Math.floor(totalRemainingMs / (60 * 1000))
        const remainingSeconds = Math.floor((totalRemainingMs % (60 * 1000)) / 1000)

        const currentMinute = Math.min(elapsedMinutes + 1, 6)

        return {
            phase: 'active',
            currentMinute,
            timeRemaining: `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`,
            totalElapsed: elapsedMinutes,
        }
    }

    // Historical phase (after 6 minutes)
    return {
        phase: 'historical',
        currentMinute: 1, // Always show M1 historical
        timeRemaining: `${elapsedMinutes}m ago`,
        totalElapsed: elapsedMinutes,
    }
}

/**
 * Get momentum bar visualization text for tooltips
 * @param vwpdDecay VWPD decay value
 * @returns String with emoji visualization
 */
export function getMomentumBarText(vwpdDecay: number): string {
    if (vwpdDecay < 5) return '🔴🔴🔴🔴🔴'
    if (vwpdDecay < 10) return '🔴🔴🔴🔴⚫'
    if (vwpdDecay < 15) return '🔴🔴🔴⚫⚫'
    if (vwpdDecay < 20) return '🔴🔴⚫⚫⚫'
    if (vwpdDecay < 30) return '🔴⚫⚫⚫⚫'
    return '⚫⚫⚫⚫⚫'
}
