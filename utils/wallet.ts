// import { chains } from '@/data/default/chains';
import { CRUSH_ETHEREUM_ADDRESS, WALLET_SOLANA_ADDRESS } from '@/data/default/chains'
import { getReadableNumber } from './price'

/**
 * Validates a crypto wallet address against a specific blockchain's format.
 *
 * @param address The wallet address string to validate.
 * @param chain The blockchain to validate against, either 'solana' or 'ethereum'.
 * @returns True if the address is valid for the specified chain, false otherwise.
 */
export const validateCryptoAddress = (address: string, chain: ChainId): boolean => {
    if (!address) {
        return false
    }

    switch (chain) {
        case 'solana':
            // Solana addresses are Base58 encoded and 32-44 characters long.
            const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
            return solanaRegex.test(address)

        //EVM addresses
        case 'ethereum':
        case 'arbitrum':
        case 'base':
        case 'bsc':
        case 'hyperliquid':
            // Ethereum addresses are 40-character hex strings, optionally prefixed with '0x'.
            const ethereumRegex = /^(0x)?[0-9a-fA-F]{40}$/
            return ethereumRegex.test(address)

        default:
            // Return false for unsupported chains or invalid input.
            return false
    }
}

export const getActivityName = (activityType: string, name: string): string => {
    switch (activityType.toLowerCase()) {
        case 'buy':
            return `Buy ${name}`
        case 'sell':
            return `Sell ${name}`
        case 'deposit':
            return `Deposit ${name}`
        case 'trade':
            return `Trade ${name}`
        case 'withdraw':
            return `Withdraw ${name}`
        case 'swap':
            return `Swap ${name}`
        case 'transfer':
            return `Transfer ${name}`
        default:
            return `${name}`
    }
}

export const getTextColor = (type: string) => {
    switch (type) {
        case 'buy':
            return 'text-positive'
        case 'deposit':
            return 'text-positive'
        case 'swap':
            return 'text-neutral-text'
        case 'sell':
            return 'text-negative'
        case 'withdraw':
            return 'text-negative'
        default:
            return 'text-neutral-text'
    }
}

export const getActivitySymbol = (type: string) => {
    switch (type) {
        case 'buy':
            return '+'
        case 'deposit':
            return '+'
        case 'sell':
            return '-'
        case 'withdraw':
            return '-'
        default:
            return ''
    }
}

export const filterWalletActivities = (walletActivities: WalletActivities) => {
    if (!walletActivities || walletActivities.length === 0) {
        return []
    }

    const filteredWalletActivities = walletActivities
        .map(({ date, activities }) => {
            if (!activities || activities.length === 0) {
                return {
                    date,
                    activities: [],
                }
            }

            const filteredActivities = activities.filter(activity => activity.priceUSD >= 0.01)

            return {
                date,
                activities: filteredActivities,
            }
        })
        .filter(wallet => wallet.activities.length > 0)

    // console.log({ filteredWalletActivities });

    return filteredWalletActivities
}

export const filterWalletBalances = (walletBalances: UserBalance[]) => {
    // const mainCurrencyChainAddresses = chains.map((chain) => chain.address);
    const filterWalletBalances = walletBalances.filter(balance => {
        // if (mainCurrencyChainAddresses.includes(balance.address)) {
        //   return true;
        // }
        return balance.priceUSD * balance.amount > 0.01
    })

    return filterWalletBalances
}

export const calculateTotalBalance = (userBalancesData: UserBalance[]) => {
    let totalBalance = 0
    userBalancesData &&
        userBalancesData.forEach(balance => {
            totalBalance += balance.amount * balance.priceUSD
        })

    return getReadableNumber(totalBalance, 2, '$')
}

export const calculateBalance = (userBalancesData: UserBalance[]) => {
    let totalBalanceUSD = 0
    let totalBalanceChange24h = 0
    let initialBalance24hAgo = 0

    if (!userBalancesData || userBalancesData.length === 0) {
        return {
            balanceChange24hPercentage: undefined,
            balanceUSD: 0,
        }
    }

    userBalancesData.forEach(balance => {
        if (balance.amount) {
            const currentValue = balance.amount * balance.priceUSD
            const previousValue = currentValue / (1 + balance.priceChange24h / 100)

            totalBalanceUSD += currentValue

            if (previousValue) {
                totalBalanceChange24h += currentValue - previousValue
                initialBalance24hAgo += previousValue
            }
        }
    })

    const totalBalanceChange24hPercentage = initialBalance24hAgo > 0 ? (totalBalanceChange24h / initialBalance24hAgo) * 100 : 0

    return {
        balanceChange24hPercentage:
            isNaN(totalBalanceChange24hPercentage) || totalBalanceChange24hPercentage == 0 ? undefined : totalBalanceChange24hPercentage / 100,
        balanceUSD: totalBalanceUSD,
    }
}

export const calculateTokenHoldings = (data: UserTokenHoldings) => {
    let totalBalanceUSD = 0
    if (!data || data.length === 0) {
        return {
            balanceChange24hPercentage: undefined,
            balanceUSD: 0,
        }
    }

    data.forEach(holding => {
        if (holding.usd_value) {
            totalBalanceUSD += holding.usd_value
        }
    })

    return {
        balanceChange24hPercentage: 0,
        balanceUSD: totalBalanceUSD,
    }
}

export const sortUserBalance = (userBalancesData: UserBalance[]) => {
    if (!userBalancesData || userBalancesData.length === 0) {
        return []
    }

    const sortedBalancesData = userBalancesData.sort((a, b) => {
        const valueA = a.amount * a.priceUSD
        const valueB = b.amount * b.priceUSD
        return valueB - valueA // Sort in descending order
    })

    return sortedBalancesData
}

export const sortUserTokenHoldings = (data: UserTokenHoldings) => {
    if (!data || data.length === 0) {
        return []
    }

    const specialAddresses = [WALLET_SOLANA_ADDRESS, CRUSH_ETHEREUM_ADDRESS]

    const sortedData = data.sort((a, b) => {
        const aIsSpecial = specialAddresses.includes(a.token.address)
        const bIsSpecial = specialAddresses.includes(b.token.address)

        // Move special addresses to the top
        if (aIsSpecial && !bIsSpecial) return -1
        if (!aIsSpecial && bIsSpecial) return 1

        // For non-special addresses, sort by USD value in descending order
        return b.usd_value - a.usd_value
    })

    return sortedData
}

export const mergeActivitiesByDate = (data: WalletActivities): WalletActivities => {
    if (!Array.isArray(data)) {
        return []
    }

    return data.reduce((acc, current) => {
        const existingDateEntry = acc.find(item => item.date === current.date)

        if (existingDateEntry) {
            existingDateEntry.activities.push(...current.activities)
        } else {
            acc.push({
                date: current.date,
                activities: [...current.activities],
            })
        }

        return acc
    }, [] as WalletActivities)
}

export const sortActivities = (data: WalletActivities) => {
    return data
        .map(dayActivities => ({
            ...dayActivities,
            activities: dayActivities.activities.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const combineProfitPercentages = (userHoldingAnalaytics: UserHoldingsAnalytic[]): number => {
    // Calculate the combined total realized_pnl_usd
    const totalPnlUsd = userHoldingAnalaytics.reduce((sum, item) => sum + item.realized_pnl_usd, 0)

    if (totalPnlUsd === 0) return 0 // Avoid division by zero

    return userHoldingAnalaytics.reduce((sum, item) => sum + item.realized_pnl_percentage * item.realized_pnl_usd, 0) / totalPnlUsd
}
// export const combineProfitPercentages = (
//   userHoldingAnalaytics: UserHoldingsAnalytic[],
// ): number => {
//   // Calculate the combined total realized_pnl_usd
//   const combinedTotalProfitUSD = userHoldingAnalaytics.reduce(
//     (sum, wallet) => sum + wallet.realized_pnl_usd,
//     0,
//   );

//   console.log({ combinedTotalProfitUSD });

//   // Calculate the weighted profit percentage
//   const combinedProfitPercentage = userHoldingAnalaytics.reduce(
//     (weightedSum, wallet) => {
//       const weightedPercentage =
//         (wallet.realized_pnl_usd * wallet.realized_pnl_percentage) /
//         combinedTotalProfitUSD;
//       console.log({ weightedPercentage });
//       return weightedSum + weightedPercentage;
//     },
//     0,
//   );

//   return combinedProfitPercentage;
// };

export function combineUserHoldingsAnalytic(solanaData: UserHoldingsAnalytic, ethereumData: UserHoldingsAnalytic): UserHoldingsAnalytic {
    const totalBalanceUsd = solanaData.balance_usd + ethereumData.balance_usd
    const totalUnrealizedPnlUsd = solanaData.unrealized_pnl_usd + ethereumData.unrealized_pnl_usd
    const totalRealizedPnlUsd = solanaData.realized_pnl_usd + ethereumData.realized_pnl_usd

    const combinedData: UserHoldingsAnalytic = {
        balance_usd: totalBalanceUsd,
        unrealized_pnl_usd: totalUnrealizedPnlUsd,
        unrealized_pnl_percentage: (solanaData.unrealized_pnl_usd + ethereumData.unrealized_pnl_usd) / totalBalanceUsd || 0,
        realized_pnl_usd: totalRealizedPnlUsd,
        realized_pnl_percentage: (solanaData.realized_pnl_usd + ethereumData.realized_pnl_usd) / totalBalanceUsd || 0,
        bought_usd: solanaData.bought_usd + ethereumData.bought_usd,
        bought_amount: solanaData.bought_amount + ethereumData.bought_amount,
        bought_average_price:
            (solanaData.bought_average_price * solanaData.bought_amount + ethereumData.bought_average_price * ethereumData.bought_amount) /
                (solanaData.bought_amount + ethereumData.bought_amount) || 0,
        sold_usd: solanaData.sold_usd + ethereumData.sold_usd,
        sold_average_price: solanaData.sold_average_price + ethereumData.sold_average_price,
        total_profit_usd: solanaData.total_profit_usd + ethereumData.total_profit_usd,
        total_profit_percentage: (solanaData.total_profit_usd + ethereumData.total_profit_usd) / totalBalanceUsd || 0,
        tags: [...solanaData.tags, ...ethereumData.tags], // Combine and deduplicate tags
        chain: 'solana', //combined
        period: solanaData.period,
    }

    return combinedData
}
