// Websocket
// ✅ eth: 1;
// ✅ base: 8453;
// ✅ solana: 100000;
// tron: 110000;
// bsc: 56;

export const CRUSH_SOLANA_ADDRESS = 'So11111111111111111111111111111111111111112'

export const WALLET_SOLANA_ADDRESS = 'So11111111111111111111111111111111111111111'

//GMGN Ethereum address is the same as Crush.
export const CRUSH_ETHEREUM_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const CRUSH_BASE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const CRUSH_BSC_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// USDC Token Addresses
export const USDC_ETHEREUM_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const USDC_SOLANA_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const USDC_ARBITRUM_ADDRESS = '0xaf88d065e77c8cc2239327c5edb3a432268e5831'

// Native Token Addresses
export const SOL_NATIVE_ADDRESS = '11111111111111111111111111111111'
export const ETH_NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'

// Chain IDs
export const CHAIN_ID_ETHEREUM = 1
export const CHAIN_ID_ARBITRUM = 42161
export const CHAIN_ID_SOLANA = 792703809

export const relayExplorerUrl = 'https://relay.link/transaction'

export const chains: Chain[] = [
    {
        id: 'solana',
        name: 'Solana',
        api: 'solana',
        symbol: 'SOL',
        address: CRUSH_SOLANA_ADDRESS,
        logo: `${process.env.basePath}/images/brand/solana.png`,
        // websocket: 100000,
        websocket: 1399811149,
        explorer: {
            tx: 'https://solscan.io/tx',
            address: 'https://solscan.io/account',
        },
        priorityFeeUnit: 'SOL',
    },
    {
        id: 'ethereum',
        name: 'Ethereum',
        api: 'ethereum',
        symbol: 'ETH',
        address: CRUSH_ETHEREUM_ADDRESS,
        logo: `${process.env.basePath}/images/brand/ethereum.png`,
        websocket: 1,
        explorer: {
            tx: 'https://etherscan.io/tx',
            address: 'https://etherscan.io/address',
        },
        priorityFeeUnit: 'Gwei',
    },
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
    },
    // {
    //   id: 'bsc',
    //   name: 'BSC',
    //   api: 'bsc',
    //   symbol: 'ETH',
    //   address: CRUSH_BSC_ADDRESS,
    //   logo: `${process.env.basePath}/images/brand/bsc.png`,
    //   websocket: 56,
    //   explorer: {
    //     tx: 'https://bscscan.com/tx',
    //     address: 'https://bscscan.com/address',
    //   },
    //   priorityFeeUnit: 'Gwei',
    // },
]

export const mainCurrencyChainAddresses = [chains.map(chain => chain.address), WALLET_SOLANA_ADDRESS, '0x0000000000000000000000000000000000000000']

export const getExplorerUrl = (chainId: ChainId, txHash: string) => {
    const selectedChain = chains.find(chain => chain.id === chainId)

    if (!selectedChain) return ''
    const explorerUrl = selectedChain.explorer.tx

    return `${explorerUrl}/${txHash}`
}

export const getChainAddress = (chainId: ChainId) => {
    const selectedChain = chains.find(chain => chain.id === chainId)

    if (!selectedChain) return undefined

    return selectedChain.address
}
