export type NewsType = 'crypto' | 'tradfi' | 'social'
export type SentimentDirection = 'Bullish' | 'Neutral' | 'Bearish'

export type SentimentMomentum = 'Low' | 'Neutral' | 'Medium' | 'High'

export type NewsCategory =
    | 'Regulation'
    | 'Macro'
    | 'Institutional'
    | 'Infrastructure'
    | 'Markets'
    | 'DeFi'
    | 'Memecoins'
    | 'Culture'
    | 'Security'
    | 'Bitcoin Strategy'

type PriceChange = {
    price: number
    timestamp: number
    change: number
}

enum TokenType {
    'hyperliquid_perps',
    'hyperliquid_spot',
}

type PriceData = {
    symbol: string
    tokenType: TokenType
    address: string
    chain: string
    isHyperliquidSupported: boolean
    currentPrice: number
    currentPriceTime: number
    priceAtNews: number
    priceAtNewsTime: number
    priceChangeBeforeNews: {
        '15s': PriceChange
        '30s': PriceChange
        '1m': PriceChange
        '2m': PriceChange
        '3m': PriceChange
        '5m': PriceChange
        '15m': PriceChange
        '1h': PriceChange
        '1d': PriceChange
    }
    currentPrice: number
    priceAtNews: number
    priceChangeSinceNews: {
        '15s': PriceChange
        '30s': PriceChange
        '1m': PriceChange
        '3m': PriceChange
        '15m': PriceChange
        '1h': PriceChange
        '1d': PriceChange
    }
}

type MentionedToken = {
    id: string
    name: string
    symbol: string
    marketCap: number
    marketCapRank: number
}

type NewsItem = {
    // _id: string
    id: string
    newsType: 'crypto' | 'tradfi' | 'social'
    isUnread?: boolean
    headline: string
    tokens: string[]
    tokensOriginal: string[]
    tokensUntradable: string[]
    chain: ChainId //'solana' | 'ethereum' | 'base' | 'bsc';
    source: string
    sourceUrl: string
    type: string
    typeUrl: string
    hasHyperliquidTokens: boolean
    sentimentDirection: SentimentDirection
    sentimentMomentum: SentimentMomentum
    priceData?: PriceData[]
    createdAt: string //timestamp
    publishTime: string //timestamp
    categories: NewsCategory[]
    mentionedTokens: MentionedToken[]
    latestIndicator?: {
        nrs: {
            description: string
            action: string
            emoji: string
            rvol: number
            pctMove: number
            priceVolRatio: number
            vwpdClose: number
            vwpdHigh: number
            vwpdDecay: number
            highCloseRatio: number | null
        }
        momentum: {
            rvol: number
            pvRatio: number
            vwpd: number
            vwpdClose: number
            netVol: number
            exhaustionScore: number
            barElapsed: number
        }
    }[]
}

type NewsPagination = {
    total: number
    page: string
    limit: string
    totalPages: number
}

type NewsTradingFilters = {
    page: string | undefined
    limit: string | undefined
    type: string | undefined
    startTime: string | undefined
    endTime: string | undefined
    type: string | undefined
    tokens: MultiSelectOption[] | undefined
    impactScores: MultiSelectOption[] | undefined
    categories: MultiSelectOption[] | undefined
}

type MultiSelectOption = { label: string; value: string }

type NewsFeedPreferences = {
    news: {
        types: string[]
        categories: string[]
        sentimentMomentums: string[]
        sentimentDirections: string[]
        symbol: string[]
        presetTickers: string[]
        filterHyperliquid: boolean
        nrsActions?: string[]
    }
    newsSourceTypes: string[]
    tradfiSourceTypes: string[]
    socialSourceTypes: string[]
    showDefaultDataSources?: boolean
    type?: string
}

type TradfiItem = {
    id: string
    text: string
    headline?: string
    created_at: string
    favorite_count: number
    retweet_count: number
    reply_count: number
    quote_count: number
    user: {
        id: string
        name: string
        screen_name: string
        profile_image_url: string
    }

    entities: SocialEntity[]
}

type SocialEntity = {
    type: 'photo' | 'video' | 'url'
    url: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: any
}
