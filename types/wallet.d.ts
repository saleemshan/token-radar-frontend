type TokenBalance = {
    token: {
        address: string
        symbol: string
        name: string
        logo: string
    }
    balance: number
    usd_value: number
    chain: string
    isHyperliquid: boolean
}
