import { SPOT_TOKENS } from './atsSpotTokens'
// export const presetAts: PresetStrategy[] = [
//     {
//         id: 'twitter-top-traders-research-strategy',
//         name: 'Twitter Top Traders Research Strategy',
//         description: `Deploy an strategy to buy tokens mentioned by specific Twitter accounts`,
//         enabled: true,
//         isPopular: true,
//         likes: 0,
//         statements: [
//             {
//                 condition: 'if',
//                 type: 'kolMentions',
//                 value: '0',
//                 operator: '=',
//             },
//             {
//                 condition: 'and',
//                 type: 'trade',
//                 value: 'buy',
//                 amount: '100',
//                 operator: '=',
//             },
//         ],

//         extraInput: [
//             {
//                 displayName: 'Twitter/X Handle',
//                 placeholder: 'blknoiz06',
//                 inputSymbol: '@',
//                 statement: {
//                     condition: 'and',
//                     type: 'kolMentions',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//             {
//                 displayName: 'Buy Amount',
//                 placeholder: 'Buy Amount',
//                 inputSymbol: '$',
//                 statement: {
//                     condition: 'and',
//                     type: 'trade',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//         ],
//     },
//     {
//         id: 'binance-spot-listing-strategy',
//         name: 'Binance Spot Listing Strategy',
//         description: `Buy every newly listed token on the Binance exchange. `,
//         enabled: true,
//         isPopular: false,
//         likes: 0,
//         statements: [
//             {
//                 condition: 'if',
//                 type: 'exchangeListing',
//                 value: 'binance',
//                 operator: '=',
//             },
//             {
//                 condition: 'and',
//                 type: 'trade',
//                 value: 'buy',
//                 amount: '0',
//                 operator: '=',
//             },
//         ],

//         extraInput: [
//             {
//                 displayName: 'Buy Amount',
//                 placeholder: 'Buy Amount',
//                 inputSymbol: '$',
//                 statement: {
//                     condition: 'and',
//                     type: 'trade',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//         ],
//     },
//     {
//         id: 'ansem-twitter-copytrading-strategy',
//         name: 'Ansem Twitter Copytrading Strategy',
//         description: `Buy every token mentioned by Ansem(@blknoiz06) on Twitter/X. `,
//         enabled: true,
//         isPopular: false,
//         likes: 0,
//         statements: [
//             {
//                 condition: 'if',
//                 type: 'kolMentions',
//                 value: 'blknoiz06',
//                 operator: '=',
//             },
//             {
//                 condition: 'and',
//                 type: 'trade',
//                 value: 'buy',
//                 amount: '0',
//                 operator: '=',
//             },
//         ],

//         extraInput: [
//             {
//                 displayName: 'Buy Amount',
//                 placeholder: 'Buy Amount',
//                 inputSymbol: '$',
//                 statement: {
//                     condition: 'and',
//                     type: 'trade',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//         ],
//     },
//     {
//         id: 'hyperliquid-spot-listing-strategy',
//         name: 'Hyperliquid Spot Listing Strategy',
//         description: `Buy every newly listed token on the Hyperliquid exchange. `,
//         likes: 0,
//         enabled: false,
//         isPopular: false,
//         statements: [
//             {
//                 condition: 'if',
//                 type: 'exchangeListing',
//                 value: 'hyperliquid',
//                 operator: '=',
//             },
//             {
//                 condition: 'and',
//                 type: 'trade',
//                 value: 'buy',
//                 amount: '100',
//                 operator: '=',
//             },
//         ],
//         extraInput: [
//             {
//                 displayName: 'Buy Amount',
//                 placeholder: 'Buy Amount',
//                 inputSymbol: '$',
//                 statement: {
//                     condition: 'and',
//                     type: 'trade',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//         ],
//     },
//     {
//         id: 'telegram-alpha-trade-strategy',
//         name: 'Telegram Alpha Trade Strategy',
//         description: `Set up an strategy to buy any token called by a Telegram
// channel.`,
//         enabled: false,
//         isPopular: false,
//         likes: 0,
//         statements: [
//             {
//                 condition: 'if',
//                 type: 'alphaGroupCalls',
//                 value: 'pastel',
//                 operator: '=',
//             },
//             {
//                 condition: 'and',
//                 type: 'trade',
//                 value: 'buy',
//                 amount: '0',
//                 operator: '=',
//             },
//         ],

//         extraInput: [
//             {
//                 displayName: 'Buy Amount',
//                 placeholder: 'Buy Amount',
//                 inputSymbol: '$',
//                 statement: {
//                     condition: 'and',
//                     type: 'trade',
//                     value: 'buy',
//                     amount: '',
//                     operator: '=',
//                 },
//             },
//         ],
//     },
// ]

// export const atsIfSources = [
//     {
//         id: 'exchangeListing',
//         name: 'Exchange Listing',
//     },
//     {
//         id: 'kolMentions',
//         name: 'KOL Mentions',
//     },
//     // {
//     //     id: 'news',
//     //     name: 'News',
//     // },
//     // {
//     //   id: 'alphaGroupCalls',
//     //   name: 'Alpha Group Calls',
//     // },
// ]

// export const atsAndSources = [
//     {
//         id: 'trade',
//         name: 'Trade',
//         category: 'action',
//     },
//     {
//         id: 'tokenChain',
//         name: 'Token Chain',
//         category: 'filter',
//     },
//     {
//         id: 'marketCap',
//         name: 'Market Cap',
//         category: 'filter',
//     },
//     // {
//     //     id: 'sentiment',
//     //     name: 'Sentiment',
//     //     category: 'filter',
//     // },
//     // {
//     //     id: 'keywords',
//     //     name: 'Keywords',
//     //     category: 'filter',
//     // },
// ]

// export const alphaGroups = [
//     {
//         id: 'spiderSensei',
//         name: 'Spider Sensei',
//     },
//     {
//         id: 'gobfam',
//         name: 'GobFam',
//     },

//     {
//         id: 'vanguard',
//         name: 'Vanguard',
//     },
// ]

// Perps: selection and any
// Spot: selection (list from you), any, and custom

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const spotTokens = Object.entries(SPOT_TOKENS).map(([key, value]) => ({
    label: key,
    value: key,
}))

export const SPOT_TARGET_DEFAULT_TOKEN_OPTIONS = [
    {
        label: 'Any Token',
        value: 'Any Token',
    },
    {
        label: 'Custom Token',
        value: 'Custom Token',
    },
    ...spotTokens,
]

export const PERPS_TARGET_DEFAULT_TOKEN_OPTIONS = [
    {
        label: 'Any Token',
        value: 'Any token',
    },
]

export const TARGET_CUSTOM_TOKEN_CHAINS = ['solana', 'ethereum']
// export const TRIGGER_EXCHANGE_LISTING = ['binance', 'hyperliquid']
export const TRIGGER_EXCHANGE_LISTING = ['binanceSpot', 'binancePerps', 'hyperliquidSpot', 'hyperliquidPerps']

export const FILTER_SENTIMENT_DIRECTIONS = ['any', 'bullish', 'neutral', 'bearish']
export const FILTER_SENTIMENT_MOMENTUMS = ['any', 'low', 'neutral', 'medium', 'high']
export const FILTER_OPERATOR: Operator[] = ['>=', '<=']

export const TRADE_TYPE = ['buy', 'sell']
