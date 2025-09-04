interface SingleAlphaFeed {
    id: number
    chain: ChainId
    address: string
    symbol: string
    sentiment: string
    content: string
    alphaFeedAt: string
    image: {
        icon: string
    }
    priceChange: number
    marketCap: number
    isValid: boolean
    type: 'default' | 'tweet'
    name?: string
    twitterScreenName?: string
    twitterAccountId?: string
    twitterListId?: string
    twitterLink?: string
    user: {
        id: string
        name: string
        screen_name: string
        profile_image_url: string
    }
}

type AlphaFeed = SingleAlphaFeed[]

type AlphaFeedMarquee = {
    id: string
    chain: string
    address: string
    name: string
    symbol: string
    mentioned_count: number
    sentiment: 'positive' | 'negative' | 'neutral'
}[]
