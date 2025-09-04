import { useEffect, useState } from 'react'
import { calculateTokenHoldings, sortUserTokenHoldings } from '@/utils/wallet'
import useUserTokenHoldingsData from './useUserTokenHoldingsData'

export default function useWalletBalances(userPublicWalletAddresses: {
    [key in ChainId]: string
}) {
    const [isBalanceLoading, setIsBalanceLoading] = useState(false)
    const [userBalances, setUserBalances] = useState<UserTokenHoldings>([])
    const [totalUserBalances, setTotalUserBalances] = useState<
        | {
              balanceChange24hPercentage: number | undefined
              balanceUSD: number
          }
        | undefined
    >(undefined)

    const {
        data: userSolanaTokenHoldings,
        isLoading: isUserSolanaTokenHoldingsRefetching,
        isFetched: isUserSolanaTokenHoldingsFetched,
        refetch: refetchSolanaTokenHoldings,
    } = useUserTokenHoldingsData('solana', userPublicWalletAddresses['solana'])

    const {
        data: userEthereumTokenHoldings,
        isLoading: isUserEthereumTokenHoldingsRefetching,
        isFetched: isUserEthereumTokenHoldingsFetched,
        refetch: refetchEthereumTokenHoldings,
    } = useUserTokenHoldingsData('ethereum', userPublicWalletAddresses['ethereum'])

    const {
        data: userBaseTokenHoldings,
        isLoading: isUserBaseTokenHoldingsRefetching,
        isFetched: isUserBaseTokenHoldingsFetched,
        refetch: refetchBaseTokenHoldings,
    } = useUserTokenHoldingsData('base', userPublicWalletAddresses['base'])

    useEffect(() => {
        if (isUserSolanaTokenHoldingsRefetching || isUserEthereumTokenHoldingsRefetching || isUserBaseTokenHoldingsRefetching) {
            setIsBalanceLoading(true)
        }

        if (
            isUserSolanaTokenHoldingsFetched &&
            isUserEthereumTokenHoldingsFetched &&
            isUserBaseTokenHoldingsFetched &&
            !isUserSolanaTokenHoldingsRefetching &&
            !isUserEthereumTokenHoldingsRefetching &&
            !isUserBaseTokenHoldingsRefetching
        ) {
            if (userEthereumTokenHoldings || userSolanaTokenHoldings || userBaseTokenHoldings) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                let tempHoldings: any[] = []

                if (userEthereumTokenHoldings) {
                    tempHoldings = [...userEthereumTokenHoldings, ...tempHoldings]
                }
                if (userSolanaTokenHoldings) {
                    tempHoldings = [...userSolanaTokenHoldings, ...tempHoldings]
                }
                if (userBaseTokenHoldings) {
                    tempHoldings = [...userBaseTokenHoldings, ...tempHoldings]
                }

                const sortedHoldings = sortUserTokenHoldings(tempHoldings)
                setUserBalances(sortedHoldings)
            }
            setIsBalanceLoading(false)
        }
    }, [
        userSolanaTokenHoldings,
        userEthereumTokenHoldings,
        userBaseTokenHoldings,
        isUserSolanaTokenHoldingsRefetching,
        isUserEthereumTokenHoldingsRefetching,
        isUserBaseTokenHoldingsRefetching,
        isUserSolanaTokenHoldingsFetched,
        isUserEthereumTokenHoldingsFetched,
        isUserBaseTokenHoldingsFetched,
    ])

    useEffect(() => {
        if (userBalances) {
            setTotalUserBalances(calculateTokenHoldings(userBalances))
        }
    }, [userBalances])

    const refreshBalances = () => {
        setIsBalanceLoading(true)
        refetchSolanaTokenHoldings()
        refetchEthereumTokenHoldings()
        refetchBaseTokenHoldings()
    }

    return {
        isBalanceLoading,
        userBalances,
        totalUserBalances,
        refreshBalances,
    }
}
