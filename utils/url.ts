export const getTokenUrl = (chain: string, address: string, isMobile: boolean = false) => {
    if (isMobile) {
        return `/memecoins/${chain}/tokens/${address}`
    } else {
        return `/memecoins/${chain}/tokens/${address}`
    }
}
