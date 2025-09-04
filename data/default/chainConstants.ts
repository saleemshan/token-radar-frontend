export enum ChainId {
    SOLANA = 792703809,
    ETHEREUM = 1,
    BASE = 8453,
}

// Native token addresses
export const NativeTokenAddress = {
    SOLANA: '11111111111111111111111111111111',
    ETHEREUM: '0x0000000000000000000000000000000000000000',
    BASE: '0x0000000000000000000000000000000000000000', // Same as Ethereum
} as const

export const DECIMALS_MULTIPLIER = {
    SOLANA: 9,
    ETHEREUM: 18,
    BASE: 18, // Same as Ethereum
}

// Solana rent and fee constants
export const SOLANA_CONSTANTS = {
    TOKEN_ACCOUNT_RENT_LAMPORTS: 2490000, // Standard ATA rent
    TRANSACTION_FEE_LAMPORTS: 10000, // Approximate transaction fee
    get TOTAL_RESERVE_LAMPORTS() {
        return this.TOKEN_ACCOUNT_RENT_LAMPORTS + this.TRANSACTION_FEE_LAMPORTS // 2049280 total
    },
    get RESERVE_SOL() {
        return this.TOTAL_RESERVE_LAMPORTS / 1000000000 // Convert to SOL (~0.002049)
    },
} as const

// For any other chain-specific constants
export const CHAIN_CONFIGS = {
    SOLANA: {
        id: 'solana',
        nativeToken: NativeTokenAddress.SOLANA,
        chainId: ChainId.SOLANA,
    },
    ETHEREUM: {
        id: 'ethereum',
        nativeToken: NativeTokenAddress.ETHEREUM,
        chainId: ChainId.ETHEREUM,
    },
    BASE: {
        id: 'base',
        nativeToken: NativeTokenAddress.BASE,
        chainId: ChainId.BASE,
    },
} as const
