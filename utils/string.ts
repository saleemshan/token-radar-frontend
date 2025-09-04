export const BASE_URL =
    process.env.NEXT_PUBLIC_NODE_ENV === 'production'
        ? 'https://crush.xyz'
        : process.env.NEXT_PUBLIC_NODE_ENV === 'staging'
        ? 'https://crush-token-radar.vercel.app'
        : process.env.NEXT_PUBLIC_NODE_ENV === 'development'
        ? 'http://localhost:3000'
        : 'https://crush.xyz'

export function getUppercaseFirstLetter(str: string): string {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateRandomId(length: number = 10): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trimWeirdStuff(arg: any) {
    if (!arg) {
        return arg
    }

    const trimmed = arg.replace('</tool_input>', '').replace('<tool_input>', '')
    return trimmed
}

export async function readFromStream(stream: TransformStream) {
    const readableStream = stream.readable
    const reader = readableStream.getReader()
    let result = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            break
        }
        result += value
    }
    return result
}

export function unescapeString(input: string): string {
    return input.replace(/\\(.)/g, (match, p1) => {
        switch (p1) {
            case 'n':
                return '\n'
            case 'r':
                return '\r'
            case 't':
                return '\t'
            case 'b':
                return '\b'
            case 'f':
                return '\f'
            case 'v':
                return '\v'
            case '\\':
                return '\\'
            case "'":
                return "'"
            case '"':
                return '"'
            case '0':
                return '\0'
            default:
                return p1 // Return the character itself if not a common escape sequence
        }
    })
}

export const getTokenSymbolAbbreviation = (symbol?: ChainId) => {
    switch (symbol) {
        case 'ethereum':
            return 'ETH'
        case 'solana':
            return 'SOL'
        case 'base':
            return 'ETH'
        default:
            return symbol
    }
}

export function validateTwitterUsernames(input: string): boolean {
    if (input === undefined || input === '') {
        return false
    }
    if (typeof input !== 'string') {
        return false
    }

    const usernames = input.split(',').map(item => item.trim())
    const errors: string[] = []
    const twitterUsernameRegex = /^@[a-zA-Z0-9_]{1,15}$/

    usernames.forEach(username => {
        if (!twitterUsernameRegex.test(username)) {
            errors.push(`Invalid Twitter username: ${username}`)
        }
    })

    if (errors.length === 0) {
        return true
    } else {
        return false
    }
}

export function validateUrls(input: string): boolean {
    if (input === undefined || input === '') {
        return false
    }
    if (typeof input !== 'string') {
        return false
    }
    const urls = input.split(',').map(item => item.trim())
    const errors: string[] = []
    // const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const urlRegex = /^https:\/\/x\.com\/i\/lists\/[\w.-\/]*$/

    urls.forEach(url => {
        if (!urlRegex.test(url)) {
            errors.push(`Invalid URL: ${url}`)
        }
    })

    if (errors.length === 0) {
        return true
    } else {
        return false
    }
}

export function validateTwitterListId(input: string): boolean {
    // Attempt to parse the input string into a number
    const parsedInput = Number(input)

    // Check if parsing was successful and if the input is a number
    if (isNaN(parsedInput)) {
        return false // Return false if the input cannot be parsed to a number
    }

    // Check if the parsed number is a positive integer
    if (!Number.isInteger(parsedInput) || parsedInput <= 0) {
        return false // Return false if it's not a positive integer
    }

    return true // Return true if it's a valid Twitter list ID
}

export function parseStringToNumber(value: string): number | null {
    // Trim any whitespace from the string
    const trimmedValue = value.trim()

    // Check if the string is empty after trimming
    if (trimmedValue === '') {
        return null
    }

    // Use parseFloat to convert the string to a number
    const parsedNumber = parseFloat(trimmedValue)

    // Check if the result is NaN (not a number)
    if (isNaN(parsedNumber)) {
        return null
    }

    // Optionally, you can check if the parsed number is an integer
    // and use parseInt if you only want to allow integers
    // if (Number.isInteger(parsedNumber)) {
    //     return parseInt(trimmedValue, 10);
    // }

    return parsedNumber
}

export function formatNumberWithCommas(input: number | string): string {
    // Convert the input to a number
    const number = typeof input === 'string' ? parseFloat(input) : input

    // Check if the input is a valid number
    if (isNaN(number)) {
        return '-'
    }

    // Format the number with commas as thousands separators
    return number.toLocaleString('en-US')
}

export function isValidTokenAddress(address: string): boolean {
    // Regular expression for EVM address validation
    const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/

    // Function to check if a string is a valid base58 encoded string
    function isValidBase58(input: string): boolean {
        const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
        for (const char of input) {
            if (!base58Chars.includes(char)) {
                return false
            }
        }
        return true
    }

    // Check if the address is a valid EVM address
    if (evmAddressRegex.test(address)) {
        return true
    }

    // Check if the address is a valid Solana address
    if (address.length >= 32 && address.length <= 44 && isValidBase58(address)) {
        return true
    }

    // If neither format is valid, return false
    return false
}

export function getSimplifyStrategyKeyString(key: string) {
    if (!key) return ''

    switch (key.toLowerCase()) {
        case 'isrunning':
            return 'Enabled'
        case 'ispublic':
            return 'Public'

        default:
            return getUppercaseFirstLetter(key.toLowerCase())
            break
    }
}

export const getExchaneListingLabel = (exchange: string) => {
    switch (exchange) {
        case 'binanceSpot':
            return 'Binance (Spot)'
        case 'binancePerps':
            return 'Binance (Perps)'
        case 'hyperliquidSpot':
            return 'Hyperliquid (Spot)'
        case 'hyperliquidPerps':
            return 'Hyperliquid (Perps)'
        default:
            return exchange
    }
}
