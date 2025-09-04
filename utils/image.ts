export const TOKEN_PLACEHOLDER_IMAGE = `${process.env.basePath}/images/placeholder/token-placeholder.png`
export const MARKET_INTELLIGENCE_PLACEHOLDER_IMAGE = `${process.env.basePath}/images/placeholder/market-intelligence-placeholder.png`

export const getTokenImage = (token: Token) => {
    if (token && token.image && token.image.icon && token.image.icon.includes('https')) {
        return token.image.icon
    }
    return TOKEN_PLACEHOLDER_IMAGE
}

export const getAlphaFeedTokenImage = (alphaFeed: SingleAlphaFeed) => {
    if (alphaFeed && alphaFeed.image && alphaFeed.image.icon && alphaFeed.image.icon.includes('https')) {
        return alphaFeed.image.icon
    }
    return TOKEN_PLACEHOLDER_IMAGE
}

export const getChainImage = (chain: ChainId) => {
    let imageSrc: string = ''
    switch (chain) {
        case 'solana':
            imageSrc = `${process.env.basePath}/images/brand/solana.png`
            break
        case 'ethereum':
            imageSrc = `${process.env.basePath}/images/brand/ethereum.png`
            break
        case 'base':
            imageSrc = `${process.env.basePath}/images/brand/base.png`
            break
        case 'bsc':
            imageSrc = `${process.env.basePath}/images/brand/bsc.png`
            break
        case 'arbitrum':
            imageSrc = `${process.env.basePath}/images/brand/arbitrum.png`
            break
        case 'hyperliquid':
            imageSrc = `${process.env.basePath}/images/brand/hyperliquid.png`
            break
        default:
            imageSrc = `${process.env.basePath}/images/placeholder.png`
            break
    }

    return imageSrc
}
