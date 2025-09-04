# PumpFun Support Feature

## Overview

The PumpFun Support feature integrates Token Radar with the PumpFun live streaming platform, enabling users to discover and trade tokens in real-time while watching live streams. This feature combines social media engagement with trading functionality, creating a unique social trading experience.

## 🎯 Key Features

-   **Live Stream Integration**: Real-time token discovery during live streams
-   **Social Trading**: Trade tokens mentioned or discussed in live content
-   **Token Discovery**: Find trending tokens through community engagement
-   **Live Market Data**: Real-time price and market cap updates
-   **Community Engagement**: Participate in live discussions while trading

## 🔴 Live Streaming Features

### Real-Time Token Discovery

-   **Live Stream Thumbnails**: Visual previews of active streams
-   **Participant Counts**: Real-time viewer and participant tracking
-   **Live Indicators**: Clear status indicators for active streams
-   **Stream Metadata**: Comprehensive information about each stream

### Stream Information

```typescript
interface PumpFunLiveToken {
    mint: string // Token mint address
    symbol: string // Token symbol
    name: string // Token name
    description: string // Stream description
    image_uri: string // Token image
    creator: string // Stream creator
    created_timestamp: number // Creation timestamp
    reply_count: number // Community engagement
    is_currently_live: boolean // Live status
    thumbnail: string // Stream thumbnail
    num_participants: number // Active participants
    complete: boolean // Stream completion status
    website: string | null // Project website
    twitter: string | null // Twitter handle
    telegram: string | null // Telegram group
    market_cap: number // Current market cap
    nsfw: boolean // Content warning
    usd_market_cap: number // USD market cap
}
```

## 🚀 User Experience

### 1. Live Stream Discovery

1. **Browse Active Streams**: View all currently live streams
2. **Filter Content**: Apply filters for content preferences
3. **Stream Preview**: See thumbnails and participant counts
4. **Join Stream**: Click to join live discussions

### 2. Trading Integration

1. **Token Identification**: Automatically identify tokens from streams
2. **Quick Buy**: Execute trades directly from stream interface
3. **Market Data**: View real-time price and market information
4. **Portfolio Updates**: Track positions and performance

### 3. User Interface Components

#### PumpFunLiveGrid

```typescript
const PumpFunLiveGrid = ({ onTokenClick, onBuyClick }: PumpFunLiveGridProps) => {
    const {
        data: pumpFunLiveData,
        isLoading,
        isError,
    } = usePumpFunLiveData({
        limit: 48,
        sort: 'currently_live',
        order: 'DESC',
    })

    // Grid layout for live streams
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {pumpFunLiveData.map(token => (
                <PumpFunLiveCard key={token.mint} token={token} onClick={() => onTokenClick?.(token)} onBuyClick={() => onBuyClick?.(token)} />
            ))}
        </div>
    )
}
```

#### PumpFunLiveCard

```typescript
const PumpFunLiveCard = ({ token, onClick, onBuyClick }: PumpFunLiveCardProps) => {
    return (
        <div className="group relative flex flex-col h-full border border-border rounded-lg bg-neutral-950 hover:bg-neutral-900/50">
            {/* Live Thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                {token.thumbnail ? (
                    <Image src={token.thumbnail} alt={`${token.name} live stream`} fill />
                ) : (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                        <MdLiveTv className="w-8 h-8 text-neutral-text-dark" />
                    </div>
                )}

                {/* Live indicator */}
                {token.is_currently_live && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                    </div>
                )}
            </div>

            {/* Content and trading interface */}
        </div>
    )
}
```

## ⚙️ Technical Implementation

### API Endpoints

#### Get Live Streams

```typescript
GET / api / pumpfun / currently - live
```

**Query Parameters:**

```typescript
{
  offset?: number,           // Pagination offset
  limit?: number,            // Number of streams to return (1-100)
  sort?: string,             // Sort field
  order?: 'ASC' | 'DESC',   // Sort order
  includeNsfw?: boolean      // Include NSFW content
}
```

**Response:**

```typescript
{
  code: 0,
  message: 'success',
  data: PumpFunLiveToken[]
}
```

### Data Management

#### usePumpFunLiveData Hook

```typescript
const usePumpFunLiveData = (params: PumpFunLiveParams = {}) => {
    return useQuery({
        queryKey: ['pumpFunLiveData', params],
        queryFn: async () => await getPumpFunLiveTokens(params),
        refetchInterval: 5000, // Refresh every 5 seconds
        retry: 2,
    })
}

const getPumpFunLiveTokens = async (params: PumpFunLiveParams) => {
    const res = await axios.get('/api/pumpfun/currently-live', {
        params: {
            offset: params.offset || 0,
            limit: params.limit || 48,
            sort: params.sort || 'currently_live',
            order: params.order || 'DESC',
            includeNsfw: params.includeNsfw || false,
        },
    })

    if (!res.data.data || res.data.data.length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}
```

### Trading Integration

#### Quick Buy Functionality

```typescript
const handleSubmitPumpFunBuy = (tokenData: PumpFunLiveToken) => {
    if (ready && !authenticated) return handleSignIn()
    if (!user) return

    const quickBuyAmount = localStorage.getItem('quickBuyAmount')

    // Calculate approximate price from market cap
    const approximatePrice = tokenData.usd_market_cap ? tokenData.usd_market_cap / 1000000000 : 0.0001

    handleExecuteTrade(
        {
            chain: 'solana', // PumpFun is always on Solana
            chainAddress: chain.address,
            action: 'buy',
            tokenAddress: tokenData.mint,
            amount: quickBuyAmount ? +quickBuyAmount : 0,
            slippageLimit: tradeSettingsData?.slippage ?? tradeSettings[chain.id].defaultSlippage,
            priorityFee: tradeSettingsData?.priorityFee ?? tradeSettings[chain.api].defaultPriorityFee,
            symbol: tokenData.symbol,
            price: approximatePrice,
        },
        user.id
    )
}
```

## 🎨 UI/UX Features

### Visual Indicators

-   **Live Status**: Red "LIVE" badge with pulsing animation
-   **Participant Count**: User count display with icon
-   **Reply Count**: Community engagement metrics
-   **Market Cap**: Real-time market capitalization display

### Interactive Elements

-   **Clickable Cards**: Navigate to token detail pages
-   **Quick Buy Button**: Lightning bolt icon for instant trading
-   **Hover Effects**: Enhanced visual feedback on interaction
-   **Responsive Design**: Optimized for all device sizes

### Content Filtering

-   **NSFW Toggle**: Option to include/exclude adult content
-   **Sort Options**: Sort by live status, creation time, market cap
-   **Pagination**: Load more streams as needed
-   **Search**: Find specific streams or tokens

## 📊 Analytics & Insights

### Stream Metrics

-   **Viewer Engagement**: Track participant counts and interactions
-   **Content Performance**: Monitor popular streams and topics
-   **Trading Correlation**: Analyze stream impact on token prices
-   **Community Growth**: Track platform adoption and engagement

### Trading Analytics

-   **Trade Volume**: Monitor trading activity from streams
-   **Success Rates**: Track successful trades and user satisfaction
-   **Market Impact**: Analyze stream influence on token markets
-   **User Behavior**: Understand trading patterns and preferences

## 🚨 Troubleshooting

### Common Issues

1. **Stream Not Loading**

    - Check internet connection
    - Verify API endpoint availability
    - Clear browser cache and refresh

2. **Trading Failures**

    - Ensure sufficient wallet balance
    - Check token availability on Solana
    - Verify slippage settings

3. **Content Display Issues**
    - Check NSFW filter settings
    - Verify content moderation status
    - Report inappropriate content

### Performance Optimization

-   **Data Refresh**: 5-second intervals for live data
-   **Lazy Loading**: Load streams as needed
-   **Image Optimization**: Compressed thumbnails for faster loading
-   **Caching**: Smart caching for improved performance
