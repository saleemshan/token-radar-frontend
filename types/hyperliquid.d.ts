/* eslint-disable @typescript-eslint/no-explicit-any */
// ------------------- HyperLiquid -------------------

export type OrderType =
    | {
          limit: {
              tif: 'Gtc' | 'Ioc' | 'Alo' | 'FrontendMarket'
          }
      }
    | {
          trigger: {
              triggerPx: string
              isMarket: boolean
              tpsl: 'tp' | 'sl'
          }
      }

export type Cancel = {
    asset: number
    oid: number
}

export type OrderRequest = {
    asset: number
    isBuy: boolean
    limitPx: number | string
    sz: number | string
    reduceOnly: boolean
    orderType: OrderType
    cloid?: string | null
}

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export type CandleSnapshot = {
    coin: string
    endTime: number
    interval: Interval
    startTime: number
}

export interface Meta {
    universe: Universe[]
}

export interface Universe {
    szDecimals: number
    name: string
    maxLeverage: number
    onlyIsolated: boolean
}

type SpotAssetCtx = {
    circulatingSupply: string
    coin: string
    dayBaseVlm: string
    dayNtlVlm: string
    markPx: string
    midPx: string
    prevDayPx: string
    totalSupply: string
}

export interface AssetCtx {
    funding: string
    openInterest: string
    prevDayPx: string
    dayNtlVlm: string
    premium: string | null
    oraclePx: string
    markPx: string
    midPx: string | null
    impactPxs: string[] | null
    dayBaseVlm: string
    coin: string
}

export interface SpotTokenDetailsData {
    name: string
    maxSupply: string
    totalSupply: string
    circulatingSupply: string
    szDecimals: number
    weiDecimals: number
    midPx: string | null
    markPx: string
    prevDayPx: string
    genesis: string | null
    deployer: string
    deployGas: string
    deployTime: string | null
    seededUsdc: string
    nonCirculatingUserBalances: any[] // Replace `any[]` with a more specific type if needed
    futureEmissions: string
}

export interface spotAssetCtxs {
    prevDayPx: string
    dayNtlVlm: string
    markPx: string
    midPx: string
    circulatingSupply: string
    coin: string
    totalSupply: string
    dayBaseVlm: string
}

export interface SpotToken {
    name: string
    szDecimals: number
    weiDecimals: number
    index: number
    tokenId: string
    isCanonical: boolean
    evmContract: EVMContract
    fullName: string | null
}

export interface SpotTokenUniverseData {
    tokens: number[]
    name: string
    index: number
    isCanonical: boolean
}

export interface SpotAsset {
    name: string
    szDecimals: number
    weiDecimals: number
    index: number
    tokenId: string
    isCanonical: boolean
    evmContract: EVMContract
    fullName: string | null
    prevDayPx: string
    dayNtlVlm: string
    markPx: string
    midPx: string
    circulatingSupply: string
    coin: string
    totalSupply: string
    dayBaseVlm: string
}

// ------------------- Info -------------------

export interface AccountProps {
    name: string
    address: string
    equity: number | number
}

export interface SubAccount {
    clearinghouseState: ClearinghouseState
    master: string
    name: string
    subAccountUser: string
}

export interface ClearinghouseState {
    assetPositions: any[]
    marginSummary: MarginSummary
    crossMarginSummary: MarginSummary
    withdrawable: string
    time: number
    crossMaintenanceMarginUsed: string
}

export interface MarginSummary {
    accountValue: string
    totalMarginUsed: string
    totalNtlPos: string
    totalRawUsd: string
}

// ------------------- OrderBook -------------------
export interface tokenPairs {
    token1: string
    token2: string
}

export interface PairData {
    pairs?: string
    assetId?: string | number
    assetCtx: AssetCtx
    universe: Universe
    priceAtNews?: number
}

export interface BookDataProps {
    asks: { px: number; sz: number; n: number }[]
    bids: { px: number; sz: number; n: number }[]
}

// ------------------- Websocket -------------------
export interface WsTrades {
    coin: string
    side: string
    px: string
    sz: string
    hash: string
    time: number
    tid: number // ID unique across all assets
}

export interface PositionsData {
    Coin: string
    Size: number
    PositionValue: number
    EntryPrice: number
    MarkPrice: number
    PNL: {
        Amount: number
        ROE: string // Percentage
    }
    LiqPrice: number
    Margin: number
    Funding: number
    TP_SL: {
        TakeProfit: number | null
        StopLoss: number | null
    }
}

export interface OpenOrders {
    Time: string // You can use Date type if you prefer
    Type: 'Buy' | 'Sell' // Type of order
    Coin: string // Name of the coin
    Direction: 'Long' | 'Short' // Direction of the order
    Size: number // Size of the order
    OriginalPrice: number // Original price set for the order
    OrderValue: number // Total value of the order
    Price: number // Current price of the order
    TriggerCondition: string // Trigger condition for the order
    TP_SL: {
        TakeProfit: number | null
        StopLoss: number | null
    }
}

export interface Twap {
    Coin: string // Name of the coin
    Size: number // Total size of the order
    ExecutedSize: number // Executed size of the order
    AveragePrice: number // Average price of the order
    RunningTime_Total: string // Running time / Total time
    ReduceOnly: boolean // Indicates if the order is reduce-only
    CreationTime: string // Time when the order was created
    Terminate: string | null // Time when the order will terminate or null if not terminated
}

export interface UserFill {
    coin: string
    px: string // price as string
    sz: string // size as string
    side: 'B' | 'S'
    time: number
    startPosition: string
    dir: string // e.g., "Open Long"
    closedPnl: string
    hash: string
    oid: number
    crossed: boolean
    fee: string
    tid: number
    feeToken: string
}

export interface FundingData {
    time: number
    coin: string
    usdc: string
    szi: string
    fundingRate: string
    nSamples: number | null
}

export interface TradeHistory {
    coin: string
    px: string
    sz: string
    side: 'A' | 'B' // A for Ask/Sell, B for Bid/Buy
    time: number
    startPosition: string
    dir: string // Can be 'Buy', 'Sell', 'Open Long', 'Close Long', 'Liquidated Cross Long', etc.
    closedPnl: string
    hash: string
    oid: number
    crossed: boolean
    fee: string
    tid: number
    feeToken: string
    liquidation?: {
        liquidatedUser: string
        markPx: string
        method: string
    }
}

export interface FundingHistory {
    Time: string // Time of the funding
    Coin: string // Name of the coin
    Size: number // Size of the funding
    Direction: 'Received' | 'Paid' // Direction of the funding
    Payment: number // Payment amount for the funding
    Rate: number // Funding rate
}

export interface OrderHistory {
    order: {
        coin: string
        side: string
        limitPx: string
        sz: string
        oid: number
        timestamp: number
        triggerCondition: string
        isTrigger: boolean
        triggerPx: string
        children: any[] // Replace `any[]` with a more specific type if needed
        isPositionTpsl: boolean
        reduceOnly: boolean
        orderType: string
        origSz: string
        tif: string
        cloid: any // Assuming cloid can be null or another type
    }
    status: string
    statusTimestamp: number
}

export interface OrderHistoryData {
    orderHistory: OrderHistory[]
}

export type AllWebData2 = PositionsData | OpenOrders | Twap | TradeHistory | FundingHistory | OrderHistory

export interface Leverage {
    type: string
    value: number
}

export interface ActiveAssetData {
    user: string
    coin: string
    leverage: Leverage
    maxTradeSzs: string[]
    availableToTrade: string[]
}

// Define the interface for the webData2 structure
export interface WebData2 {
    clearinghouseState: ClearinghouseState
    leadingVaults: any[] // Assuming leadingVaults is an array of unknown objects
    totalVaultEquity: string
    openOrders: OpenOrder[]
    agentAddress: string
    agentValidUntil: number
    cumLedger: string
    meta: Meta
    assetCtxs: AssetCtx[]
    spotState: SpotState
    spotAssetCtxs: SpotAssetCtx[]
}

interface ClearinghouseState {
    marginSummary: MarginSummary
    crossMarginSummary: MarginSummary
    crossMaintenanceMarginUsed: string
    withdrawable: string
    assetPositions: AssetPosition[]
    time: number
}

interface MarginSummary {
    accountValue: string
    totalNtlPos: string
    totalRawUsd: string
    totalMarginUsed: string
}

interface AssetPosition {
    type: string
    position: Position
}

interface Position {
    coin: string
    szi: string
    leverage: Leverage
    entryPx: string
    positionValue: string
    unrealizedPnl: string
    returnOnEquity: string
    liquidationPx: string
    marginUsed: string
    maxLeverage: number
    cumFunding: CumFunding
}

interface Leverage {
    type: string
    value: number
}

interface CumFunding {
    allTime: string
    sinceOpen: string
    sinceChange: string
}

interface OpenOrder {
    coin: string
    side: string
    limitPx: string
    sz: string
    oid: number
    timestamp: number
    triggerCondition: string
    isTrigger: boolean
    triggerPx: string
    children: any[] // Assuming children is an array of unknown objects
    isPositionTpsl: boolean
    reduceOnly: boolean
    orderType: string
    origSz: string
    tif: string
    cloid: any // Assuming cloid can be null or another type
}

// ------------------- Market Data -------------------

interface Precision {
    amount: number
    price: number
}

interface Limits {
    leverage: Record<string, unknown>
    amount: Record<string, unknown>
    price: Record<string, unknown>
    cost: {
        min: number
    }
}

interface Info {
    prevDayPx: string
    dayNtlVlm: string
    markPx: string
    midPx: string | null
    circulatingSupply: string
    coin: string
    totalSupply: string
    dayBaseVlm: string
    tokens: number[]
    name: string
    index: string
    isCanonical: boolean
}

export interface MarketDataItem {
    defaultLeverage: string | undefined
    id: string
    symbol: string
    base: string
    quote: string
    baseId: string
    quoteId: string
    type: string
    spot: boolean
    swap: boolean
    future: boolean
    option: boolean
    index: boolean
    active: boolean
    contract: boolean
    taker: number
    maker: number
    precision: Precision
    limits: Limits
    marginModes: Record<string, unknown>
    info: Info
}

export interface Balance {
    coin: string
    token: number
    total: string
    hold: string
    entryNtl: string
}

export interface SpotState {
    balances: Balance[]
}

export interface PerpetualAssetContext {
    dayNtlVlm: string
    funding: string
    impactPxs: string[]
    markPx: string
    midPx: string
    openInterest: string
    oraclePx: string
    premium: string
    prevDayPx: string
}

export interface PerpetualUniverse {
    name: string
    szDecimals: number
    maxLeverage: number
    onlyIsolated: boolean
}

export interface PerpetualsMetaCtxsResponse {
    code: number
    message: string
    data: [
        {
            universe: PerpetualUniverse[]
        },
        PerpetualAssetContext[]
    ]
}
