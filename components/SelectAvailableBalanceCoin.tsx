import React, { useEffect, useRef, useMemo } from 'react'
import { FaWallet } from 'react-icons/fa'
import RelayBridgeChainTokenModal from './modal/RelayBridgeChainTokenModal'
import Spinner from './Spinner'
import { ModalMethods } from './modal/Modal'
import { getReadableNumber } from '@/utils/price'
import useWalletBalances from '@/hooks/data/useWalletBalances'
import { useUser } from '@/context/UserContext'
import { NativeTokenAddress } from '@/data/default/chainConstants'
import useRelayChains from '@/hooks/data/useRelayChains'
import useRelayCurrencies from '@/hooks/data/useRelayCurrencies'
import { RelayChain, RelayToken } from '@/types/bridge'
import { useUserSettings, useMutateUserSettings } from '@/hooks/data/useUserSettings'
import { usePrivy } from '@privy-io/react-auth'

const SelectAvailableBalanceCoin = ({
    chain,
    token,
    setToken,
    setChain,
}: {
    chain?: RelayChain
    token?: RelayToken
    setToken: React.Dispatch<React.SetStateAction<RelayToken | undefined>>
    setChain: React.Dispatch<React.SetStateAction<RelayChain | undefined>>
}) => {
    const { userPublicWalletAddresses, chain: userChain } = useUser()
    const { authenticated } = usePrivy()
    const { isBalanceLoading, userBalances } = useWalletBalances(userPublicWalletAddresses)
    const { data: chainList, isLoading: isChainsLoading } = useRelayChains()
    const { data: currencies, isLoading: isCurrenciesLoading } = useRelayCurrencies(chain?.id)
    const { data: userSettings } = useUserSettings()
    const { mutate: updateUserSettings } = useMutateUserSettings()

    const bridgeChainTokenModalRef = useRef<ModalMethods>(null)

    // Helper function to find token balance
    const tokenBalance = useMemo(() => {
        if (!token || !chain) return null

        const chainMapping: { [key: number]: string } = {
            792703809: 'solana',
            1: 'ethereum',
            8453: 'base',
        }

        const balance = userBalances.find(
            balance =>
                (balance.token.address.toLowerCase() === token.address.toLowerCase() ||
                    balance.token.symbol.toLowerCase() === token.symbol.toLowerCase()) &&
                balance.chain === chainMapping[token.chainId]
        )

        return balance?.balance ?? 0
    }, [token, chain, userBalances])

    // Set default chain based on user settings or user's current chain
    useEffect(() => {
        if (!chainList || chain) return

        if (authenticated && userSettings?.selected_token_chain) {
            const savedChain = chainList.find((c: RelayChain) => c.name.toLowerCase() === userSettings.selected_token_chain.toLowerCase())
            if (savedChain) {
                setChain(savedChain)
                return
            }
        }

        // Fallback to user's current chain if no saved preference
        const defaultChain = chainList.find((c: RelayChain) => c.name === userChain.name.toLowerCase())
        if (defaultChain) {
            setChain(defaultChain)
        }
    }, [chainList, userChain.name, setChain, chain, authenticated, userSettings])

    // Set default token based on selected chain or user settings
    useEffect(() => {
        if (!chain || token || !currencies) return

        if (authenticated && userSettings?.selected_token_address) {
            const savedToken = currencies.find((t: RelayToken) => t.address === userSettings.selected_token_address)

            if (savedToken) {
                setToken(savedToken)
                return
            }
        }

        // Fallback to default token selection
        const defaultToken = currencies.find((t: RelayToken) => {
            if (chain.name === 'solana') {
                return t.symbol === 'SOL' && t.address === NativeTokenAddress.SOLANA
            }
            if (chain.name === 'ethereum') {
                return t.symbol === 'ETH' && t.address === NativeTokenAddress.ETHEREUM
            }
            if (chain.name === 'base') {
                return t.symbol === 'ETH' && t.address === NativeTokenAddress.BASE
            }
            return false
        })

        if (defaultToken) {
            setToken(defaultToken)
        }
    }, [chain, token, currencies, setToken, authenticated, userSettings])

    // Save selected token to user settings
    const handleTokenSelection = (newToken?: RelayToken) => {
        if (newToken && chain) {
            setToken(newToken)
            if (authenticated) {
                updateUserSettings({
                    selected_token_address: newToken.address,
                    selected_token_chain: chain.name.toLowerCase(),
                })
            }
        }
    }

    return (
        <div className="relative">
            <button
                type="button"
                className="flex gap-2 items-center"
                onClick={() => {
                    bridgeChainTokenModalRef.current?.toggleModal()
                }}
            >
                <FaWallet />
                <div className="flex items-center gap-1">
                    {isCurrenciesLoading || isChainsLoading || isBalanceLoading ? (
                        <Spinner />
                    ) : (
                        <>
                            {getReadableNumber(tokenBalance ?? 0, 3)} {token?.symbol}{' '}
                        </>
                    )}
                </div>
            </button>

            <RelayBridgeChainTokenModal
                ref={bridgeChainTokenModalRef}
                chainList={chainList ?? []}
                chain={chain}
                token={token}
                setChain={setChain}
                setToken={handleTokenSelection}
            />
        </div>
    )
}

export default SelectAvailableBalanceCoin
