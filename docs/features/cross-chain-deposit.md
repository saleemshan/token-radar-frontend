# Cross-Chain Deposit Feature

## Overview

The Cross-Chain Deposit feature enables users to seamlessly transfer tokens across different blockchain networks within the Token Radar platform. This feature supports multiple chains including Solana, Ethereum, Base, and Arbitrum, providing a unified interface for cross-chain operations.

## 🎯 Key Features

-   **Multi-Chain Support**: Transfer tokens between Solana, Ethereum, Base, and Arbitrum
-   **Automated Bridging**: Seamless cross-chain operations with minimal user intervention
-   **Real-Time Tracking**: Monitor transaction status across different networks
-   **Security Validation**: Built-in security checks and transaction verification
-   **Gas Optimization**: Smart gas fee estimation and optimization

## 🔗 Supported Chains

| Chain    | Network ID | Native Token | Status    |
| -------- | ---------- | ------------ | --------- |
| Solana   | 1399811149 | SOL          | ✅ Active |
| Ethereum | 1          | ETH          | ✅ Active |
| Base     | 8453       | ETH          | ✅ Active |
| Arbitrum | 42161      | ETH          | ✅ Active |

## 🚀 User Experience

### 1. Deposit Flow

1. **Select Source Chain**: Choose the blockchain network where your tokens are located
2. **Select Token**: Pick the token you want to deposit (ETH, SOL, USDC, etc.)
3. **Enter Amount**: Specify the amount to deposit
4. **Review & Confirm**: Review transaction details and confirm
5. **Processing**: Monitor real-time transaction status
6. **Completion**: Receive confirmation and updated balances

### 2. User Interface Components

-   **Chain Selector**: Dropdown to choose source and destination chains
-   **Token Selector**: Token picker with balance display
-   **Amount Input**: Numeric input with validation and balance checks
-   **Transaction Status**: Real-time progress indicator
-   **Confirmation Modal**: Final review before execution

## ⚙️ Technical Implementation

### API Endpoints

#### Cross-Chain Deposit

```typescript
POST / api / hyperliquid / cross - chain - deposit
```

**Request Body:**

```typescript
{
  "amount": string,           // Amount in smallest unit
  "originChainId": string,    // Source chain identifier
  "originCurrency": string,   // Source token address
  "quoteId"?: string         // Optional quote identifier
}
```

**Response:**

```typescript
{
  "success": boolean,
  "transactionId": string,
  "status": "pending" | "completed" | "failed",
  "estimatedTime": number
}
```

#### Relay Bridge Execution

```typescript
POST / api / relay / execute
```

**Request Body:**

```typescript
{
  "originChainId": string,      // Source chain
  "destinationChainId": string, // Destination chain
  "originCurrency": string,     // Source token
  "destinationCurrency": string, // Destination token
  "tradeType": "buy" | "sell",
  "amount": string
}
```

### Core Components

#### HyperliquidUsdcConverter

```typescript
// Handles cross-chain deposits for native tokens
const handleConfirm = async () => {
    if (selectedPair.metadata?.isNative || selectedPair.symbol === 'SOL' || selectedPair.symbol === 'ETH') {
        const response = await axios.post('/api/hyperliquid/cross-chain-deposit', {
            amount: amountInSmallestUnit,
            originChainId: selectedToken.chainId,
            originCurrency: selectedToken.address || '',
            quoteId: quoteData?.details?.operation,
        })

        // Handle success and refresh balances
    }
}
```

#### TradeForm Integration

```typescript
// Integrates with cross-chain trading system
const handleTrade = async () => {
    await handleExecuteCrossChainTrade(
        {
            amount: smallestUnit,
            originCurrency: selectedBridgeToken?.address ?? '',
            originChainId: selectedBridgeChain?.name ?? '',
            destinationChainId: tokenData?.chain_id ?? '',
            destinationCurrency: tokenData?.address ?? '',
            destinationCurrencySymbol: tokenData?.symbol ?? '',
        },
        user.id
    )
}
```

### State Management

#### TradeContext

```typescript
interface CrossChainTradeParams {
    amount: string
    originCurrency: string
    originChainId: string
    destinationChainId: string
    destinationCurrency: string
    destinationCurrencySymbol: string
}

const handleExecuteCrossChainTrade = async (body: CrossChainTradeParams, userId: string) => {
    // Execute cross-chain trade logic
    // Handle transaction processing
    // Update UI state
}
```

## 🔒 Security Features

### Authentication

-   **Privy Integration**: Secure user authentication and wallet management
-   **API Key Protection**: Backend API calls protected with API keys
-   **User Validation**: Server-side user verification for all transactions

### Transaction Validation

-   **Amount Validation**: Ensures positive amounts and sufficient balances
-   **Chain Validation**: Verifies supported chain combinations
-   **Token Validation**: Validates token addresses and compatibility

### Error Handling

```typescript
try {
    const response = await axios.post('/api/hyperliquid/cross-chain-deposit', {
        // ... request data
    })

    return NextResponse.json(response.data, { status: 200 })
} catch (error) {
    const axiosError = error as AxiosError<ErrorResponseData>
    const status = axiosError.response?.status || 500

    // Handle specific error cases
    if (status === 404) {
        return NextResponse.json(
            {
                error: 'Wallet not found',
                details: errorDetails,
            },
            { status }
        )
    }

    return NextResponse.json(
        {
            error: errorMessage,
            details: errorDetails,
        },
        { status }
    )
}
```

## 📊 Monitoring & Analytics

### Transaction Tracking

-   **Real-Time Status**: WebSocket updates for transaction progress
-   **Blockchain Confirmations**: Monitor confirmations across networks
-   **Gas Fee Tracking**: Track gas costs and optimization opportunities

### Error Monitoring

-   **Failed Transaction Logs**: Comprehensive error logging and analysis
-   **Performance Metrics**: Track success rates and processing times
-   **User Experience Metrics**: Monitor user flow and completion rates

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient Balance**

    - Check token balance on source chain
    - Ensure sufficient gas fees for transaction
    - Verify token approval status

2. **Network Congestion**

    - Monitor gas prices on target network
    - Consider using priority fees for faster processing
    - Wait for network conditions to improve

3. **Token Compatibility**
    - Verify token is supported on destination chain
    - Check if token requires special handling
    - Ensure proper token metadata

### Support Resources

-   **Transaction Explorer**: Use chain-specific explorers to verify transactions
