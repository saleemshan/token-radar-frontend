type FavouriteToken = {
    address: string
    logo?: string
    name?: string
    symbol?: string
    priceChange24h: number
    chain: ChainId
    price?: number
    mcap?: number
}

type UserReferralCode = {
    _id: string
    privyId: string
    referrerId: string | null
    isKol: boolean
    referCode: string
    createdAt: number
    updatedAt: number
}

type UserReferralCommission = {
    privyId: string
    commissionStats: {
        BTC?: number
        SOL?: number
        ETH?: number
    }
}

type UserReferralRate = {
    rates: {
        level1: number
        level2: number
        level3: number
    }
    point_bonus: number
    user_points: number
    is_kol: boolean
}

type ReferralDownline = {
    privyId: string
    _id: string
    referCode: string
    wallet?: string
}

type UserReferralDownlines = {
    privyId: string
    downlines: {
        [tier: string]: ReferralDownline[]
    }
}

type UserReferralLevel = {
    points: number
    level: number
    currentExp: number
    expToNextLevel: number
    commissionBonus: number
    totalExpNeeded: number
    currentLevelThreshold: number
    nextLevelThreshold: number
}

type UserReferralPoints = {
    totalPoints: {
        totalPoints: number
        tradePoints: number
        referralPoints: number
    }
    seasonPoints: {
        totalPoints: number
        tradePoints: number
        referralPoints: number
    }
}

type TokenHolding = {
    address: string
    token_address: string
    symbol: string
    name: string
    decimals: number
    logo: string
    price_change_6h: number
    is_show_alert: number
    is_honeypot: number
    current_market_cap?: number
    current_price?: number
}

type UserTokenHolding = {
    token: TokenHolding
    balance: number
    usd_value: number
    realized_profit_30d: number
    realized_profit: number
    realized_pnl: number
    realized_pnl_30d: number
    unrealized_profit: number
    unrealized_pnl: number
    total_profit: number
    total_profit_pnl: number
    avg_cost: number
    avg_sold: number
    buy_30d: number
    sell_30d: number
    sells: number
    price: number
    cost: number
    position_percent: number
    last_active_timestamp: number
    history_sold_income: number
    history_bought_cost: number
    chain: ChainId
    avg_bought_mcap: number
    isHyperliquid?: boolean
}

type UserTokenHoldings = UserTokenHolding[]

type UserHoldingsAnalytic = {
    balance_usd: number
    unrealized_pnl_usd: number
    unrealized_pnl_percentage: number
    realized_pnl_usd: number
    realized_pnl_percentage: number
    bought_usd: number
    bought_amount: number
    bought_average_price: number
    sold_usd: number
    sold_average_price: number
    total_profit_usd: number
    total_profit_percentage: number
    tags: string[]
    chain: ChainId
    period: string
}

type UserHoldingsAnalytics = UserHoldingsAnalytic[]

interface User {
    email?: {
        address?: string
    }
    wallet?: {
        address?: string
        chainType?: string
        chainId?: string
    }
    _id?: string
    privyId?: string
    createdAt?: number
    updatedAt?: number
}

type TokenSearchHistory = {
    chain: ChainId
    address: string
    name: string
    symbol: string
    logo: string
}

type ReferralLeaderBoard = {
    privyId: string
    seasonPoints: {
        totalPoints: number
        tradePoints: number
        referralPoints: number
    }
    referCode: string
    isKol: boolean
    wallet?: string
}[]
