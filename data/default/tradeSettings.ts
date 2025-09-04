export const tradeSettings: DefaultTradeSettingsMap = {
    solana: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 0.006 },
            { name: 'Medium', value: 0.01 },
            { name: 'High', value: 0.015 },
        ],
        defaultSlippage: 0, //0.065 = 6.5%, 0=auto
        defaultPriorityFee: 0, //0=auto
        antiMev: true,
    },
    ethereum: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 30 },
            { name: 'Medium', value: 40 },
            { name: 'High', value: 50 },
        ],
        defaultSlippage: 0, //0.03 = 3%, 0=auto
        defaultPriorityFee: 0, // gasFee , 0=auto
        antiMev: true,
    },
    base: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 30 },
            { name: 'Medium', value: 40 },
            { name: 'High', value: 50 },
        ],
        defaultSlippage: 0.03, //0.03 = 3%
        defaultPriorityFee: 30, // gasFee
        antiMev: true,
    },
    bsc: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 30 },
            { name: 'Medium', value: 40 },
            { name: 'High', value: 50 },
        ],
        defaultSlippage: 0.03, //0.03 = 3%
        defaultPriorityFee: 30, // gasFee
        antiMev: true,
    },
    arbitrum: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 30 },
            { name: 'Medium', value: 40 },
            { name: 'High', value: 50 },
        ],
        defaultSlippage: 0.03, //0.03 = 3%
        defaultPriorityFee: 30, // gasFee
        antiMev: true,
    },
    hyperliquid: {
        slippages: [0, 3, 5, 10], //display
        priorityFees: [
            { name: 'Auto', value: 0 },
            { name: 'Low', value: 30 },
            { name: 'Medium', value: 40 },
            { name: 'High', value: 50 },
        ],
        defaultSlippage: 0.03, //0.03 = 3%
        defaultPriorityFee: 30, // gasFee
        antiMev: true,
    },
}

export const NEWS_TRADING_DEFAULT_BIG_AMOUNT = 10000
export const NEWS_TRADING_DEFAULT_SMALL_AMOUNT = 5000
