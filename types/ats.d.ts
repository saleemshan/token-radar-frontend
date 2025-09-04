type Condition = 'if' | 'and'
type Exchange = 'binance' | 'hyperliquid'
type TokenChain = 'solana' | 'ethereum'

type IfType = 'token' | 'customToken' | 'anyToken'
type TriggerType = 'exchangeListing' | 'kolMentions' | 'alphaGroupCalls' | 'keywords'
type FilterType = 'marketCap' | 'sentimentDirection' | 'sentimentMomentum'
type ActionType = 'leverage' | 'trade'

type Group = 'token' | 'trigger' | 'filter' | 'action'

type Operator = '=' | '>' | '<' | '>=' | '<='

type PresetStrategy = {
    enabled: boolean
    id: string
    name: string
    likes: number
    isPopular: boolean
    statements: Statement[]
    description: string
    extraInput?: {
        displayName: string
        placeholder?: string
        inputSymbol?: string
        statement: Statement
    }[]
}

type Strategy = {
    id: string
    strategyId: string
    privyId: string
    status: string
    strategyName: string
    strategyValue: string
    strategyType: string
    isRunning: boolean
    hasExecuted: boolean
    isPublic: boolean
    likes: number
    description: string
    statements: Statement[]
    logs: IndividualStrategyLog[]
    updatedAt: number
    createdAt: number
    isNewsTrading?: boolean
    isPerps?: boolean
}

type FormStrategy = {
    strategyName: string
    isRunning: boolean
    isPublic: boolean
    description: string
    statements: Statement[]
}

interface IndividualStrategyLog {
    _id: string
    strategy_id: string
    privyId: string
    type: 'trade' | 'update'
    deletedAt: string
    createdAt: string
    updatedAt: string
}

type PriorityFeeLog = {
    highFees: {
        context: {
            slot: number
        }
        per_compute_unit: {
            extreme: number
            high: number
            low: number
            medium: number
            percentiles: Record<string, number>
        }
        per_transaction: {
            extreme: number
            high: number
            low: number
            medium: number
            percentiles: Record<string, number>
        }
        recommended: number
    }[]
    highFeesArray: number[]
}

type TradeResponse = {
    success: boolean
    txid: string
    priorityFee: number
    slippageAuto: boolean
    method: string
    priorityFeeLog: PriorityFeeLog
    finalSlippageBps: number
    finalPriorityFeeLamports: number
    platformFeeAmount: number
    totalNativeTokenTraded: number
}

type NewsInfo = {
    headline: string
    sentimentDirection: string
    sentimentMomentum: string
    tokens: string[]
}
interface MemecoinsSpotExtraData {
    chain: string
    fromToken: string
    toToken: string
    priorityFee: string
    slippageLimit: string
    fromTokenInfo: ActivityTokenInfo
    toTokenInfo: ActivityTokenInfo
    txResult: TradeResponse
    newsInfo: NewsInfo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
    errorType?: string
}

interface HyperliquidPerpsExtraData {
    newsInfo: NewsInfo
    leverage: string
    newsId: string
    orderType: string
    reduceOnly: boolean
    timeInForce: string
    errorType?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any
}

interface TradeLog extends IndividualStrategyLog {
    amount: number
    price: number
    symbol: string
    status: string //success//failed
    usdValue: number
    isPerps: boolean
    extraData: MemecoinsSpotExtraData | HyperliquidPerpsExtraData
}

interface UpdateLog extends IndividualStrategyLog {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    oldValue: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newValue: any
    updatedFields: string[]
}

type ActivityTokenInfo = {
    address: string
    chain: string
    symbol: string
    name: string
    image: string
}

type Statement = {
    condition: Condition
    type: IfType | TriggerType | FilterType | ActionType
    value: string
    operator: Operator
    group: Group
    amount?: string // for buy/sell
    chain?: string // for spot customToken
}
