# Base Token Support Feature

## Overview

The Base Token Support feature provides native integration with the Base network, Coinbase's Layer 2 (L2) scaling solution built on Ethereum. This feature enables users to trade ETH and USDC on Base with optimized gas fees and fast transaction processing, while maintaining full compatibility with the broader Ethereum ecosystem.

## 🎯 Key Features

-   **Native Base Support**: Full integration with Base network infrastructure
-   **Optimized Gas Fees**: Significantly reduced transaction costs compared to Ethereum mainnet
-   **Fast Transactions**: Quick confirmation times with L2 scaling benefits
-   **Cross-Chain Bridging**: Seamless transfers between Base and other supported networks
-   **ETH & USDC Trading**: Support for primary tokens on Base network

## 🔗 Network Specifications

### Base Network Details

| Property           | Value                    |
| ------------------ | ------------------------ |
| **Network ID**     | 8453                     |
| **Chain ID**       | 8453                     |
| **RPC URL**        | https://mainnet.base.org |
| **Block Explorer** | https://basescan.org     |
| **Native Token**   | ETH                      |
| **Gas Token**      | ETH                      |
| **Block Time**     | ~2 seconds               |
| **Finality**       | ~12 seconds              |

### Supported Tokens

| Token    | Symbol | Address                                    | Decimals | Status    |
| -------- | ------ | ------------------------------------------ | -------- | --------- |
| Ethereum | ETH    | 0x0000000000000000000000000000000000000000 | 18       | ✅ Active |
| USD Coin | USDC   | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 | 6        | ✅ Active |
| Tether   | USDT   | 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb | 6        | ✅ Active |

## 🚀 User Experience

### 1. Base Network Selection

1. **Chain Picker**: Select Base from supported networks
2. **Wallet Connection**: Connect wallet with Base network support
3. **Network Validation**: Automatic network detection and switching
4. **Balance Display**: Show ETH and USDC balances on Base

### 2. Trading on Base

1. **Token Selection**: Choose from available Base tokens
2. **Amount Input**: Enter trade amount with balance validation
3. **Gas Estimation**: View optimized gas fees for Base network
4. **Transaction Execution**: Fast confirmation with L2 benefits

### 3. Cross-Chain Operations

1. **Bridge Selection**: Choose Base as source or destination
2. **Token Bridging**: Transfer tokens between Base and other networks
3. **Status Tracking**: Monitor bridge transaction progress
4. **Completion**: Receive tokens on target network

## ⚙️ Technical Implementation

### Chain Configuration

#### Chain Definition

```typescript
// data/default/chains.ts
{
  id: 'base',
  name: 'Base',
  api: 'base',
  symbol: 'ETH',
  address: CRUSH_BASE_ADDRESS,
  logo: `${process.env.basePath}/images/brand/base.png`,
  websocket: 8453,
  explorer: {
    tx: 'https://basescan.org/tx',
    address: 'https://basescan.org/address',
  },
  priorityFeeUnit: 'Gwei',
}
```

#### Chain Constants

```typescript
// data/default/chainConstants.ts
export enum ChainId {
    BASE = 8453,
}

export const NativeTokenAddress = {
    BASE: '0x0000000000000000000000000000000000000000', // Same as Ethereum
} as const

export const DECIMALS_MULTIPLIER = {
    BASE: 18,
} as const

export const CHAIN_CONFIGS = {
    BASE: {
        id: 'base',
        nativeToken: NativeTokenAddress.BASE,
        chainId: ChainId.BASE,
    },
} as const
```

### Type Definitions

#### Chain ID Types

```typescript
// types/type.d.ts
type ChainId = 'solana' | 'ethereum' | 'base' | 'bsc' | 'arbitrum' | 'hyperliquid'

type UserPublicWalletAddresses = {
    [key in ChainId]: string
}
```

### WebSocket Integration

#### Network-Specific WebSocket

```typescript
// utils/tokenWSS.ts
export class WebSocketManager {
    constructor(pair: string, chain: string) {
        let chainId: number

        switch (chain) {
            case 'base':
                chainId = 8453
                break
            // ... other chains
        }

        this.pairId = `${pair}:${chainId}`
    }
}
```

### Token Selection Logic

#### Base Token Filtering

```typescript
// components/SelectAvailableBalanceCoin.tsx
useEffect(() => {
    if (!chain || token || !currencies) return

    // Fallback to default token selection
    const defaultToken = currencies.find((t: RelayToken) => {
        if (chain.name === 'base') {
            return t.symbol === 'ETH' && t.address === NativeTokenAddress.BASE
        }
        // ... other chains
        return false
    })

    if (defaultToken) {
        setToken(defaultToken)
    }
}, [chain, token, currencies, setToken])
```

#### Bridge Token Support

```typescript
// components/modal/RelayBridgeChainTokenModal.tsx
useEffect(() => {
    if (currencies && currencies.length > 0) {
        const tokens: RelayToken[] = []

        currencies.forEach((token: RelayToken) => {
            if (selectedChain?.name === 'base') {
                if (['ETH', 'USDC', 'USDT'].includes(token.symbol)) {
                    tokens.push(token)
                }
            }
            // ... other chains
        })

        setTokenList(tokens)
    }
}, [currencies, selectedChain])
```

## 🎨 User Interface Components

### Chain Button

```typescript
// components/ChainButton.tsx
const ChainButton = ({ chain, isSelected, onClick }: ChainButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'
            }`}
        >
            <Image src={chain.logo} alt={chain.name} width={20} height={20} />
            <span className="font-medium">{chain.name}</span>
        </button>
    )
}
```

### Token Display

```typescript
// components/TokenName.tsx
const TokenName = ({ token, showSocials = true, showTokenAddress = true, size = 'small' }) => {
    return (
        <div className="flex items-center gap-2">
            <Image src={token.image.icon} alt={token.symbol} width={24} height={24} />
            <div className="flex flex-col">
                <span className="font-medium">{token.symbol}</span>
                {showTokenAddress && <span className="text-xs text-neutral-text-dark">{token.chain_id === 'base' ? 'Base' : token.chain_id}</span>}
            </div>
        </div>
    )
}
```

## 🔒 Security Features

### Network Validation

-   **Chain ID Verification**: Ensure correct network connection
-   **Address Validation**: Verify token addresses on Base network
-   **Transaction Signing**: Secure wallet integration and signing
-   **Gas Limit Protection**: Prevent excessive gas consumption

### Token Safety

-   **Contract Verification**: Verify token contracts on Base
-   **Liquidity Checks**: Ensure sufficient trading liquidity
-   **Slippage Protection**: Built-in slippage limits for safety
-   **Transaction Monitoring**: Track and flag suspicious activity

## 📊 Performance & Optimization

### Gas Fee Optimization

-   **L2 Scaling Benefits**: Significantly reduced gas costs
-   **Batch Transactions**: Optimize multiple operations
-   **Priority Fee Management**: Smart fee estimation
-   **Gas Price Monitoring**: Real-time gas price tracking

### Transaction Speed

-   **Fast Confirmations**: ~2 second block times
-   **L2 Finality**: Quick transaction finalization
-   **Network Congestion Handling**: Efficient transaction queuing
-   **Optimistic Updates**: Immediate UI feedback

## 🚨 Troubleshooting

### Common Issues

1. **Network Connection Problems**

    - Verify wallet is connected to Base network
    - Check RPC endpoint availability
    - Ensure proper network configuration

2. **Transaction Failures**

    - Verify sufficient ETH balance for gas fees
    - Check token approval status
    - Ensure proper slippage settings

3. **Bridge Issues**
    - Verify source and destination networks
    - Check bridge liquidity and availability
    - Monitor bridge transaction status

### Performance Issues

-   **Slow Transactions**: Check network congestion
-   **High Gas Fees**: Monitor gas price fluctuations
-   **Failed Bridges**: Verify bridge service status
