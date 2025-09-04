export const getReadableNumber = (value?: number, decimals: number = 2, currency: string = '', absolute: boolean = false): string => {
    if (typeof value !== 'number' || isNaN(value)) {
        return `${currency} 0.00`
    }

    let normalizedValue: number = value
    if (absolute) {
        normalizedValue = Math.abs(value)
    }

    const divisorMapping = [
        { divisor: 1_000_000_000, label: 'B' },
        { divisor: 1_000_000, label: 'M' },
        { divisor: 1_000, label: 'K' },
    ]

    for (const { divisor, label } of divisorMapping) {
        if (normalizedValue >= divisor) {
            return `${currency}${(normalizedValue / divisor).toFixed(decimals)}${label}`
        }
    }

    return `${currency}${normalizedValue.toFixed(decimals)}`
}

export function getNumberWithCommas(input: number | string, wholeNumber: boolean = false): string {
    let numberValue: number

    if (typeof input === 'string') {
        numberValue = parseFloat(input)
        if (isNaN(numberValue)) {
            return ''
        }
    } else if (typeof input === 'number') {
        numberValue = input
    } else {
        return ''
    }

    if (wholeNumber) {
        numberValue = Math.round(numberValue)
    }

    return numberValue.toLocaleString('en-US')
}

export const getPercentageChange = (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return 0 // Avoid division by zero

    const change = ((newValue - oldValue) / oldValue) * 100
    return change
}

export function countDecimalPlaces(value: number, largeNumDecimal = 2, smallNumDecimal = 3): number {
    if (!value) return 0
    if (value === 0) return 0

    // For numbers greater than or equal to 1, return fixed decimal places count of 3
    if (Math.abs(value) >= 1) {
        return largeNumDecimal
    }

    // Convert the number to a string representation
    let strValue = value.toString()

    // Handle numbers in exponential form
    if (strValue.includes('e')) {
        strValue = value.toFixed(20).replace(/0+$/, '')
    }

    // Find the decimal point
    const decimalIndex = strValue.indexOf('.')
    if (decimalIndex === -1) {
        return 0
    }

    const decimalPart = strValue.slice(decimalIndex + 1)

    // Calculate decimal places for numbers less than 1
    let nonZeroCount = 0
    let count = 0

    for (let i = 0; i < decimalPart.length; i++) {
        count++
        if (decimalPart[i] !== '0') {
            nonZeroCount++
        }
        // Stop when we've captured all the non-zero digits
        if (nonZeroCount >= smallNumDecimal) {
            break
        }
    }

    return count
}

export function getDecimalPlaces(value: number, largeNumDecimal = 2): number {
    if (!value) return 0
    if (value === 0) return 0

    const absValue = Math.abs(value)

    // For numbers >= 10000, show no decimals
    if (absValue >= 10000) {
        return 0
    }
    // For numbers between 1000-9999, show 1 decimal place
    else if (absValue >= 1000) {
        return 1
    }
    // For numbers between 10-99, show 3 decimal places
    else if (absValue >= 10 && absValue < 100) {
        return 3
    }
    // For numbers between 1-9, show 4 decimal places
    else if (absValue >= 1 && absValue < 10) {
        return 4
    }
    // For numbers less than 1
    else if (absValue < 1) {
        // Convert the number to a string representation
        const strValue = value.toString()

        // Handle numbers in exponential form
        const decimalIndex = strValue.indexOf('.')
        if (decimalIndex === -1) {
            return 0
        }

        const decimalPart = strValue.slice(decimalIndex + 1)

        // Count leading zeros
        let leadingZeros = 0
        for (let i = 0; i < decimalPart.length; i++) {
            if (decimalPart[i] === '0') {
                leadingZeros++
            } else {
                break
            }
        }

        // Apply the same logic as formatCryptoPrice
        if (leadingZeros === 0) {
            // For numbers like 0.65615 without leading zeros
            return 5
        } else if (leadingZeros === 1 || leadingZeros === 2) {
            // For numbers like 0.013628 or 0.00365 with 1 or 2 leading zeros
            return 5
        } else if (leadingZeros === 3) {
            // Check if the first non-zero digit is 8 or lower
            const firstNonZeroDigit = parseInt(decimalPart[leadingZeros] || '0')
            if (firstNonZeroDigit <= 8) {
                // For numbers like 0.0008129
                return 7
            } else {
                // For numbers like 0.001119
                return 6
            }
        } else {
            // For other cases with more leading zeros
            return Math.min(leadingZeros + 2, 8)
        }
    }

    // Default case (though should not reach here)
    return largeNumDecimal
}

type PriceData = {
    markPx: string // Current price as a string
    prevDayPx: string // Previous day's price as a string
}

export function calculate24HourChange(data: PriceData) {
    const { markPx, prevDayPx } = data

    const current = parseFloat(markPx)
    const prev = parseFloat(prevDayPx)

    // Handle cases where prev is 0 or invalid
    if (!prev || prev === 0) return 0

    const change = ((current - prev) / prev) * 100
    // Handle Infinity or NaN cases

    return isFinite(change) ? change : 0
}

/**
 * Formats a crypto price with comma separators for thousands and appropriate decimal precision
 * @param price - The price value to format
 * @param maxDecimals - Maximum number of decimal places to show
 * @returns Formatted price string with comma separators
 */
export function formatCryptoPrice(price?: number | string, maxDecimals: number = 8, forceDecimals?: number): string {
    // Handle undefined, null, NaN
    if (price === undefined || price === null) return '0'

    // Convert string to number if needed
    const numPrice = typeof price === 'string' ? parseFloat(price) : price

    // Check for NaN
    if (isNaN(numPrice)) return '0'

    // If forceDecimals is provided, use it directly
    if (forceDecimals !== undefined) {
        return numPrice.toLocaleString('en-US', {
            maximumFractionDigits: forceDecimals,
            minimumFractionDigits: forceDecimals,
            currency: 'USD',
        })
    }

    // Handle very small values that would display as 0
    if (numPrice !== 0 && Math.abs(numPrice) < 0.000001) {
        return numPrice.toExponential(2)
    }

    // Automatically determine appropriate decimal places based on value
    let decimalPlaces = 2 // Default

    if (Math.abs(numPrice) < 1) {
        // For small values, find significant digits
        const strValue = numPrice.toString()
        const decimalIndex = strValue.indexOf('.')

        if (decimalIndex !== -1) {
            const decimalPart = strValue.slice(decimalIndex + 1)
            // Count leading zeros and add more precision
            let leadingZeros = 0
            for (let i = 0; i < decimalPart.length; i++) {
                if (decimalPart[i] === '0') {
                    leadingZeros++
                } else {
                    break
                }
            }
            if (leadingZeros === 0) {
                // For numbers like 0.65615 without leading zeros, show 5 decimal places
                decimalPlaces = Math.min(5, maxDecimals)
            } else if (leadingZeros === 1 || leadingZeros === 2) {
                // For numbers like 0.013628 with 1 leading zero, show 5 decimal places
                decimalPlaces = Math.min(5, maxDecimals)
            } else if (leadingZeros === 3) {
                // Check if the first non-zero digit is 8 or lower
                const firstNonZeroDigit = parseInt(decimalPart[leadingZeros] || '0')
                if (firstNonZeroDigit <= 8) {
                    // For numbers like 0.0008129, show 7 decimal places
                    decimalPlaces = Math.min(7, maxDecimals)
                } else {
                    // For numbers like 0.001119, show 6 decimal places
                    decimalPlaces = Math.min(6, maxDecimals)
                }
            } else {
                // Show at least 2 significant digits for small numbers with leading zeros
                decimalPlaces = Math.min(leadingZeros + 2, maxDecimals)
            }
        }
    } else if (Math.abs(numPrice) >= 10000) {
        // For very large numbers, show no decimals
        decimalPlaces = 0
    } else if (Math.abs(numPrice) >= 1000) {
        // For moderately large numbers, show 1 decimal place
        decimalPlaces = 1
    } else if (Math.abs(numPrice) >= 10 && Math.abs(numPrice) < 100) {
        // For numbers between 10 and 99, show 3 decimal places
        decimalPlaces = 3
    } else if (Math.abs(numPrice) >= 1 && Math.abs(numPrice) < 10) {
        // For numbers between 1 and 9, show 4 decimal places
        decimalPlaces = 4
    }

    // Use toLocaleString for comma formatting
    return numPrice.toLocaleString('en-US', {
        maximumFractionDigits: decimalPlaces,
        minimumFractionDigits: decimalPlaces,
        currency: 'USD',
    })
}

export const parseHyperliquidPrice = (px: number = 0): string => {
    // Handle edge cases
    if (px === 0 || !isFinite(px)) return '0'

    // If it's an integer, return as-is (integers are always allowed)
    if (Number.isInteger(px)) {
        return px.toString()
    }

    // Limit to 5 significant figures for non-integers
    const significant5 = parseFloat(px.toPrecision(5))

    // Convert to string to work with decimal places
    let result = significant5.toString()

    // Remove scientific notation if present
    if (result.includes('e')) {
        result = significant5.toFixed(10).replace(/\.?0+$/, '')
    }

    // Apply the original Hyperliquid formatting rules
    const pxFormatted = significant5.toFixed(6)

    let pxAdjusted: string
    if (pxFormatted.startsWith('0.')) {
        pxAdjusted = pxFormatted
    } else {
        const pxSplit = pxFormatted.split('.')
        const whole = pxSplit[0]
        const decimals = pxSplit[1]

        const diff = 5 - whole.length
        const sep = diff > 0 ? '.' : ''

        pxAdjusted = sep === '' ? `${whole}` : toFixed(`${whole}${sep}${decimals}`, diff)
    }

    const pxCleaned = removeTrailingZeros(pxAdjusted)
    return positive(pxCleaned)
}

export const toFixed = (n: number | string, fixed: number) => `${n}`.match(new RegExp(`^-?\\d+(?:\.\\d{0,${fixed}})?`))?.[0] || '0'

export const parseHyperliquidSize = (sz: number | string = 0, szDecimals: number = 5): string => {
    const px = removeTrailingZeros(toFixed(sz, szDecimals))

    return positive(px)
}

const removeTrailingZeros = (s: string) => {
    let result = s
    while (result.endsWith('0') && result.includes('.')) {
        result = result.slice(0, -1)
    }
    if (result.endsWith('.')) {
        result = result.slice(0, -1)
    }
    return result
}

const positive = (value: string) => {
    return value.startsWith('-') ? '0' : value
}

/**
 * Calculate market order price with slippage protection
 * @param marketPrice - Current market price
 * @param orderSide - 'buy' for long, 'sell' for short
 * @param slippagePercent - Slippage percentage (e.g., 5 for 5%)
 * @returns Price adjusted for slippage
 */
export const calculateMarketOrderPrice = (marketPrice: number, orderSide: 'buy' | 'sell', slippagePercent: number): number => {
    const slippageMultiplier = slippagePercent / 100

    if (orderSide === 'buy') {
        // For buy orders (long), add slippage to protect against price increases
        return marketPrice * (1 + slippageMultiplier)
    } else {
        // For sell orders (short), subtract slippage to protect against price decreases
        return marketPrice * (1 - slippageMultiplier)
    }
}

/**
 * Get formatted market order price with slippage for Hyperliquid API
 * @param marketPrice - Current market price
 * @param orderSide - 'buy' for long, 'sell' for short
 * @param slippagePercent - Slippage percentage (e.g., 5 for 5%)
 * @returns Formatted price string for API
 */
export const getMarketOrderPriceWithSlippage = (marketPrice: string | number, orderSide: 'buy' | 'sell', slippagePercent: number): string => {
    const price = typeof marketPrice === 'string' ? parseFloat(marketPrice) : marketPrice
    const adjustedPrice = calculateMarketOrderPrice(price, orderSide, slippagePercent)
    return parseHyperliquidPrice(adjustedPrice)
}

/**
 * Enhanced price formatting for Hyperliquid with full tick size compliance
 * @param px - Price value
 * @param szDecimals - Size decimals for the asset (from meta response)
 * @param isSpot - Whether it's a spot market (true) or perp (false)
 * @returns Properly formatted price string
 */
export const parseHyperliquidPriceWithTickSize = (px: number = 0, szDecimals: number = 0, isSpot: boolean = false): string => {
    // Handle edge cases
    if (px === 0 || !isFinite(px)) return '0'

    // If it's an integer, return as-is (integers are always allowed)
    if (Number.isInteger(px)) {
        return px.toString()
    }

    // Limit to 5 significant figures for non-integers
    const significant5 = parseFloat(px.toPrecision(5))

    // Calculate max decimal places: MAX_DECIMALS - szDecimals
    const MAX_DECIMALS = isSpot ? 8 : 6
    const maxDecimalPlaces = MAX_DECIMALS - szDecimals

    // Convert to string and limit decimal places
    let result = significant5.toString()

    // Handle scientific notation
    if (result.includes('e')) {
        result = significant5.toFixed(maxDecimalPlaces).replace(/\.?0+$/, '')
    } else {
        // Ensure we don't exceed max decimal places
        const decimalIndex = result.indexOf('.')
        if (decimalIndex !== -1) {
            const decimalPart = result.substring(decimalIndex + 1)
            if (decimalPart.length > maxDecimalPlaces) {
                result = significant5.toFixed(maxDecimalPlaces)
            }
        }
    }

    // Remove trailing zeros
    result = removeTrailingZeros(result)

    return positive(result)
}

/**
 * Get formatted market order price with slippage and proper tick size handling
 * @param marketPrice - Current market price
 * @param orderSide - 'buy' for long, 'sell' for short
 * @param slippagePercent - Slippage percentage (e.g., 5 for 5%)
 * @param szDecimals - Size decimals for the asset (optional, defaults to basic formatting)
 * @param isSpot - Whether it's a spot market (optional, defaults to perp)
 * @returns Formatted price string for API
 */
export const getMarketOrderPriceWithSlippageAndTickSize = (
    marketPrice: string | number,
    orderSide: 'buy' | 'sell',
    slippagePercent: number,
    szDecimals?: number,
    isSpot?: boolean
): string => {
    const price = typeof marketPrice === 'string' ? parseFloat(marketPrice) : marketPrice
    const adjustedPrice = calculateMarketOrderPrice(price, orderSide, slippagePercent)

    // Use enhanced formatting if szDecimals is provided
    if (szDecimals !== undefined) {
        return parseHyperliquidPriceWithTickSize(adjustedPrice, szDecimals, isSpot || false)
    }

    // Fallback to basic formatting
    return parseHyperliquidPrice(adjustedPrice)
}
