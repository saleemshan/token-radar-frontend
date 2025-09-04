import { countDecimalPlaces, getDecimalPlaces } from '@/utils/price'

// Makes requests to Binance API
export async function makeApiRequest(path: string) {
    try {
        const response = await fetch(`https://api.binance.com/${path}`)
        return response.json()
    } catch (error) {
        throw new Error(`[Binance] request error: ${error}`)
    }
}

export async function makeBinanceRequest(path: string) {
    try {
        const response = await fetch(`https://api.binance.com/${path}`)
        return response.json()
    } catch (error) {
        throw new Error(`[Binance] request error: ${error}`)
    }
}

// Generates a symbol ID from a pair of the coins
export function generateSymbol(exchange: string, fromSymbol: string, toSymbol: string) {
    const short = `${fromSymbol}/${toSymbol}`
    return {
        short,
        full: `${exchange}:${short}`,
    }
}

export function parseFullSymbol(fullSymbol: string) {
    const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/)
    if (!match) {
        return null
    }
    return { exchange: match[1], symbol: `${match[2]}${match[3]}` }
}

export function priceScale(tickSize: string | number) {
    if (Number(tickSize) >= 1) {
        return Math.pow(10, Number(tickSize))
    } else {
        return Math.round(1 / parseFloat(String(tickSize)))
    }
}

export function getDecimalPlacesAndScale(value?: number, decimalsToKeep: number = 6): { decimalPlaces: number; scale: number } {
    if (!value) {
        return {
            decimalPlaces: decimalsToKeep,
            scale: Math.pow(10, decimalsToKeep),
        }
    }
    // const actualDecimalPlaces = value.toString().split('.')[1]?.length || 0;
    // // console.log(value.toString().split('.')[1]);

    // const newDecimalPlaces =
    //   actualDecimalPlaces > decimalsToKeep ? decimalsToKeep : actualDecimalPlaces;

    const newDecimalPlaces = countDecimalPlaces(value, 3, decimalsToKeep)

    // const newDecimalPlaces = getDecimalPlaces(value, 3)

    // Calculate the scaling factor
    const scale = Math.pow(10, newDecimalPlaces)

    return {
        decimalPlaces: newDecimalPlaces,
        scale: scale,
    }
}

export function getDecimalPlacesAndScaleForHyperliquid(value?: number, decimalsToKeep: number = 6): { decimalPlaces: number; scale: number } {
    if (!value) {
        return {
            decimalPlaces: decimalsToKeep,
            scale: Math.pow(10, decimalsToKeep),
        }
    }
    // const actualDecimalPlaces = value.toString().split('.')[1]?.length || 0;
    // // console.log(value.toString().split('.')[1]);

    // const newDecimalPlaces =
    //   actualDecimalPlaces > decimalsToKeep ? decimalsToKeep : actualDecimalPlaces;

    const newDecimalPlaces = getDecimalPlaces(value, 3)

    // const newDecimalPlaces = getDecimalPlaces(value, 3)

    // Calculate the scaling factor
    const scale = Math.pow(10, newDecimalPlaces)

    return {
        decimalPlaces: newDecimalPlaces,
        scale: scale,
    }
}

export function convertResolutionToMinutes(resolution: string): number {
    switch (resolution.toLowerCase()) {
        case '1d':
            return 1440 // 1 day = 1440 minutes
        default:
            return +resolution
    }
}
