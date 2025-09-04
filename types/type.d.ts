type ChainId = 'solana' | 'ethereum' | 'base' | 'bsc' | 'arbitrum' | 'hyperliquid'

type UserPublicWalletAddresses = {
    [key in ChainId]: string
}

type Token = {
    id: string
    address: string
    symbol: string
    name: string
    image: {
        icon: string
        banner: string?
    }
    links: {
        x?: string
        telegram?: string
        website?: string
    }
    market_data: {
        current_price: {
            usd: number
        }
        market_cap: {
            usd: number
        }
        circulating_market_cap: {
            usd: number
        }
        liquidity: number
        fdv: number
        total_transactions: {
            '5m': {
                buy: number
                sell: number
            }
            '1h': {
                buy: number
                sell: number
            }
            '6h': {
                buy: number
                sell: number
            }
            '24h': {
                buy: number
                sell: number
            }
        }
        price_change: {
            '5m': {
                value: number
                percentage: number
            }
            '1h': {
                value: number
                percentage: number
            }
            '6h': {
                value: number
                percentage: number
            }
            '24h': {
                value: number
                percentage: number
            }
        }
        volume: {
            '5m': number
            '1h': number
            '6h': number
            '24h': number
        }
    }
    created_at: string
    suspicious: boolean
    suspicious_reason?: string
    generator?: string
    safety_score?: number
    pair_address: string
    quote_token: 'token0' | 'token1'
    chain_id: ChainId
    top_10_holder_rate: number
    holder_count: number
}

type TokenHolderTag =
    | 'creator'
    | 'top_holder'
    | 'dev_team'
    | 'sniper'
    | 'whale'
    | 'transfer_in'
    | 'rat_trader'
    | 'gmgn'
    | 'bullx'
    | 'photon'
    | 'pepeboost'
    | 'trojan'
    | 'sniper'
    | 'dev'
    | 'insiders'
    | 'smartmoney'

type TokenHolder = {
    address: string
    balance: number // sol balance in usd
    owned_percentage: number // percentage format as a number
    owned_usd: number
    pnl_percentage: number // percentage format as a number
    pnl_usd: number
    avg_bought_price: number
    avg_sold_price: number
    buy_count: number
    sell_count: number
    last_active: string // ISO date string format
    sol_balance: number
    eth_balance: number
    tags: TokenHolderTag[]
}

type TokenHolders = {
    holders: TokenHolder[]
    analytics: {
        top10: number
        top50: number
        others: number
    }
}

type TokenHoldersNoteworthy = {
    token_address: string
    chain_id: ChainId
    noteworthy_holders: NoteworthyHoldersHoldings[]
}

type NoteworthyHoldersHoldings = {
    rank: number
    sol_balance: number
    wallet_address: string
    holdings: NoteworthyHoldersHolding[]
}

type NoteworthyHoldersHolding = {
    token_name: string
    value_usd: string
}

type TokenHoldersOvertime = {
    [key: number]: number
}

type Insider = {
    type: 'insiders' | 'smartmoney' | 'dev' | 'sniper'
    current_position: 'buymore' | 'hold' | 'sellsome' | 'sellall' | 'no holdings' | 'transferred'
    address: string
    current_holding: number
    first_fifty_holders: boolean
    owned_percentage?: number
    owned_usd?: number
}

type Insiders = Insider[]

type TokenInsiders = {
    addresses: Insider[]
    analytics: {
        current_total_holdings_percentage: number
        top_10_holders_percentage: number
        total_bought_percentage: number
        total_insiders: number
        total_snipers: number
    }
}

type NewTokenInsider = {
    analytics: {
        top_holders_percentage: string
        total_holders: number
        sniper_count: number
        insider_count: number
        total_bought: number
        current_holdings: number
        unrealised_value: number
        realised_value: number
    }
    graph_data: {
        holding: number
        sold: number
        holding_percentage: string
        sold_percentage: string
    }
    deployer: string
    total_supply: string
    holders: NewTokenInsiderHolder[]
}

type NewTokenInsiderHolder = {
    address: string
    balance: string
    percentage_held: string
    current_holding_value: number
    label: string
    initial_supply_held: number
    current_holding_value_usdt: string
}

type TradeSettings = {
    chain: string
    slippage: number
    priorityFee: number
    antiMev: boolean
}

type ExecuteTrade = {
    chain: string
    chainAddress: string
    action: 'buy' | 'sell'
    tokenAddress: string
    amount: number
    slippageLimit: number
    priorityFee: number
    symbol?: string
    price: number
}

type TradeDetails = {
    fromTokenSymbol?: string
    toTokenSymbol?: string
    fromTokenImage?: string
    toTokenImage?: string
    estimateReceive?: number
}

type UserWithdraw = {
    chain: string
    chainAddress: string
    fromAsset: string
    toWallet: string
    amount: number
    symbol: string
    name: string
}

type Message = {
    id: string
    type: 'ai' | 'user'
    avatar: string
    name: string
    content: string
}

type TokenMyPositions = {
    analytics: {
        balance_usd: number
        unrealized_pnl_usd: number
        unrealized_pnl_percentage: number
        realized_pnl_usd: number
        realized_pnl_percentage: number
        bought_usd: number
        bought_average_price: number
        sold_usd: number
        sold_average_price: number
        total_profit_usd: number
        total_profit_percentage: number
        accountAddress: string
        filter: string
        pairAddress: string
    }
    transactions: Transaction[]
}

type Transaction = {
    transaction_hash: string
    executed_at: string
    maker: string
    type: 'buy' | 'sell'
    amount: number
    price_usd: number
    total_usd: number
    share_url: string
}

type TokenSecurity = {
    score: number
    descripton: string
    metrics: TokenSecurityMetric[]
}

type TokenMarketIntelligence = {
    id: string
    symbol: string
    name: string
    token_ca: string
    called_at: string
    called_price: number
    called_market_cap: number
    current_price: number
    current_market_cap: number
    market_cap_percentage_change: number
    image: {
        icon: string
    }
    share_url?: string
}[]

type TokenSecurityMetric = {
    name: string
    pass: boolean
    tooltip: string
    value: string
}

type Chain = {
    id: ChainId
    name: string
    api: ChainId
    symbol: string
    address: string
    logo: string
    websocket: number
    explorer: {
        tx: string
        address: string
    }
    priorityFeeUnit: string
}

type TokenPrice = {
    tokenName: string
    priceUSD: number
    chain: string
}

type TickerPrice = {
    symbol: string
    price: string
}

type UserBalance = {
    address: string
    chain: ChainId
    amount: number
    name: string
    symbol: string
    logo: string
    priceUSD: number
    priceChange24h: number
}

type TradePreset = {
    buy: number
    sell: number
}

type WalletActivity = {
    transactionHash: string
    type: 'buy' | 'sell' | 'withdraw' | 'deposit' | 'unknown' //"buy" = trade sol of other token | "sell" = trade other token of sol | "withdraw" = transfer token to other wallet | "deposit" = transfer token from other wallet
    tokenName: string
    tokenSymbol: string
    tokenAddress: string
    tokenLogo: string
    amount: number
    priceUSD: number // token price in USD when buying/selling
    executedAt: string
    chain: ChainId
}

type WalletActivities = {
    date: string //sort by latest
    activities: WalletActivity[]
}[]

interface KlineData {
    open: number
    high: number
    low: number
    close: number
    volume: number
    timestamp: number
}

interface CodeProps {
    node?: unknown
    inline?: boolean
    className?: string
    children?: React.ReactNode[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any // Allow any other props
}

interface PriorityFee {
    name: string
    value: number
}

interface DefaultTradeSettings {
    defaultSlippage: number
    defaultPriorityFee: number
    slippages: number[]
    priorityFees: PriorityFee[]
    antiMev: boolean
}

interface DefaultTradeSettingsMap {
    solana: DefaultTradeSettings
    ethereum: DefaultTradeSettings
    base: DefaultTradeSettings
    bsc: DefaultTradeSettings
    arbitrum: DefaultTradeSettings
    hyperliquid: DefaultTradeSettings
}

interface TokenLiquidity {
    id: string
    base_address: string
    quote_address: string
    quote_symbol: string
    base_reserve: string
    quote_reserve: string
    initial_base_reserve: string
    initial_quote_reserve: string
    base_reserve_usd: string
    quote_reserve_usd: string
    quote_percentage_change: number
}

type TrendingTokensInterval = '5m' | '1h' | '4h' | '12h' | '24h'

type TradingViewDataFeedEvent = {
    price: number
    mcap: number
    tokenAddress: string
    chain: string
}

type TradingViewStreamingStatusEvent = {
    status: 'connecting' | 'online' | 'error' | 'offline' | undefined
}

type TokenAnalyticsEvent = {
    '5m': SingleTokenAnalytics
    '1h': SingleTokenAnalytics
    '6h': SingleTokenAnalytics
    '24h': SingleTokenAnalytics
}

type SingleTokenAnalytics = {
    buyTransactions: number
    sellTransactions: number
    totalTransactions: number
    buyVolume: number
    sellVolume: number
    totalVolume: number
    buyers: number
    sellers: number
    traders: number
    totalParticipants: number
}

type DevTransaction = {
    transaction_hash: string
    executed_at: string
    maker: string
    type: 'buy' | 'sell' | 'add'
    amount: number
    price_usd: string
    base_amount: number
    base_price_usd: number
    total_usd: number
    share_url: string
}

type DevAnalytics = {
    balance: string
    unrealized_pnl_usd: number
    realized_pnl_usd: number
    history_bought_amount: number
    bought_usd: number
    bought_average_price: number
    history_sold_amount: number
    sold_usd: number
    sold_average_price: number
    total_profit_usd: number
    current_holding_percentage: number
    total_supply_percentage: number
    accountAddress: string
    filter: string
    never_held: boolean
}

type TokenDevInfo = {
    analytics: DevAnalytics
    transactions: DevTransaction[]
}

interface NewPairToken {
    id: number
    chain: ChainId
    address: string
    symbol: string
    logo: string
    price: number
    price_change_percent: number
    swaps: number
    volume: number
    liquidity: number
    market_cap: number
    hot_level: number
    pool_creation_timestamp: number
    holder_count: number
    twitter_username: string
    website: number
    telegram: number
    open_timestamp: number
    price_change_percent1m: number
    price_change_percent5m: number
    price_change_percent1h: number
    buys: number
    sells: number
    initial_liquidity: number
    is_show_alert: number
    top_10_holder_rate: number
    renounced_mint: number
    renounced_freeze_account: number
    burn_ratio: number
    burn_status: string
    launchpad: string
    dev_token_burn_amount: number
    dev_token_burn_ratio: number
    dexscr_ad: number
    dexscr_update_link: number
    cto_flag: number
    twitter_change_flag: number
    creator_token_status: string
    creator_close: number
    launchpad_status: number
    rat_trader_amount_rate: number
    bluechip_owner_percentage: number
    smart_degen_count: number
    renowned_count: number
}

type DetailedStatsBucketTimestamp = {
    start: number
    end: number
    __typename: string
}

type DetailedStatsNumberMetrics = {
    change: number
    currentValue: number
    previousValue: number
    buckets: number[]
    __typename: string
}

type DetailedStatsStringMetrics = {
    change: number
    currentValue: string
    previousValue: string
    buckets: string[]
    __typename: string
}

type WindowSize = 'min5' | 'hour1' | 'hour4' | 'hour12' | 'day1'

type WindowedDetailedStats = {
    windowSize: WindowSize
    timestamp: number
    endTimestamp: number
    buckets: DetailedStatsBucketTimestamp[]
    transactions: DetailedStatsNumberMetrics
    volume: DetailedStatsStringMetrics
    buys: DetailedStatsNumberMetrics
    sells: DetailedStatsNumberMetrics
    buyers: DetailedStatsNumberMetrics
    sellers: DetailedStatsNumberMetrics
    traders: DetailedStatsNumberMetrics
    buyVolume: DetailedStatsStringMetrics
    sellVolume: DetailedStatsStringMetrics
    __typename: string
}

interface TokenDetailedStats {
    pairId: string
    tokenOfInterest: 'token0' | 'token1'
    statsType: string
    stats_min5: WindowedDetailedStats
    stats_hour1: WindowedDetailedStats
    stats_hour4: WindowedDetailedStats
    stats_hour12: WindowedDetailedStats
    stats_day1: WindowedDetailedStats
    __typename: string
}
