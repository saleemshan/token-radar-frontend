import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Image from 'next/image'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import useWalletBalances from '@/hooks/data/useWalletBalances'
import { useUser } from '@/context/UserContext'
import { getReadableNumber } from '@/utils/price'
import { ChainId, NativeTokenAddress } from '@/data/default/chainConstants'
import useRelayCurrencies from '@/hooks/data/useRelayCurrencies'
import { RelayChain } from '@/types/bridge'
import { RelayToken } from '@/types/bridge'
import XButton from '../ui/XButton'

interface BridgeChainTokenModalProps {
    chainList: RelayChain[]
    setChain: (chain: RelayChain | undefined) => void
    setToken: (token: RelayToken | undefined) => void
    chain: RelayChain | undefined
    token: RelayToken | undefined
}

const RelayBridgeChainTokenModal = forwardRef<ModalMethods, BridgeChainTokenModalProps>(
    ({ chainList: initialChainList, setChain, setToken, chain, token: selectedToken }, ref) => {
        const modalRef = React.createRef<ModalMethods>()

        const { userPublicWalletAddresses } = useUser()

        const { isBalanceLoading, userBalances } = useWalletBalances(userPublicWalletAddresses)

        const [chainList, setChainList] = useState<RelayChain[]>(initialChainList)
        const [selectedChain, setSelectedChain] = useState<RelayChain | undefined>(undefined)
        const [filteredchainList, setFilteredChainList] = useState<RelayChain[]>([])
        const [searchChainInput, setSearchChainInput] = useState('')
        const [searchTokenInput, setSearchTokenInput] = useState('')

        const { data: currencies, isFetching: isCurrenciesLoading } = useRelayCurrencies(selectedChain?.id)

        const [tokenList, setTokenList] = useState<RelayToken[]>([])

        const handleToggleModal = useCallback(() => {
            modalRef.current?.toggleModal()
        }, [modalRef])

        const handleSelectChain = (chain: RelayChain) => {
            setChain(chain)
            setToken(undefined)
            setSelectedChain(chain)
        }

        const handleSelectToken = (token: RelayToken) => {
            setChain(selectedChain)
            setToken(token)
            modalRef.current?.toggleModal()
        }

        useImperativeHandle(ref, () => ({
            toggleModal: () => handleToggleModal(),
            closeModal: () => {
                modalRef.current?.closeModal()
            },
            openModal: () => {
                modalRef.current?.openModal()
            },
        }))

        useEffect(() => {
            if (chain) {
                setSelectedChain(chain)
            }
        }, [chain])

        useEffect(() => {
            if (currencies && currencies.length > 0) {
                const tokens: RelayToken[] = []

                currencies.forEach((token: RelayToken) => {
                    if (selectedChain?.name === 'solana') {
                        if (
                            (token.symbol === 'SOL' && token.address === NativeTokenAddress.SOLANA) ||
                            token.symbol === 'USDC' ||
                            token.symbol === 'USDT'
                        ) {
                            tokens.push(token)
                        }
                    } else if (selectedChain?.name === 'ethereum') {
                        if (['ETH', 'USDC', 'USDT'].includes(token.symbol)) {
                            tokens.push(token)
                        }
                    } else if (selectedChain?.name === 'base') {
                        if (['ETH', 'USDC', 'USDT'].includes(token.symbol)) {
                            tokens.push(token)
                        }
                    }
                })

                setTokenList(tokens)
            }
        }, [currencies, selectedChain])

        useEffect(() => {
            const newFilteredChainList = chainList.filter(chain => {
                return chain.displayName.toLowerCase().includes(searchChainInput.toLowerCase())
            })

            setFilteredChainList(newFilteredChainList)
        }, [searchChainInput, chainList])

        useEffect(() => {
            setChainList(initialChainList)
            setFilteredChainList(initialChainList)
        }, [initialChainList])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const findTokenBalance = (token: RelayToken, balances: any[]) => {
            const chainMapping: { [key: number]: string } = {
                [ChainId.SOLANA]: 'solana',
                [ChainId.ETHEREUM]: 'ethereum',
                [ChainId.BASE]: 'base',
            }

            return balances.find(
                balance =>
                    (balance.token.address.toLowerCase() === token.address.toLowerCase() ||
                        balance.token.symbol.toLowerCase() === token.symbol.toLowerCase()) &&
                    balance.chain === chainMapping[token.chainId]
            )
        }

        return (
            <Modal ref={modalRef}>
                <div
                    className={` max-w-2xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full max-h-[50vh] min-h-[50vh] `}
                >
                    <div className="p-3 flex border-b border-border items-center bg-black">
                        <div className=" text-base font-semibold leading-6 text-white flex-1 ">Select Token</div>

                        <div>
                            <XButton onClick={handleToggleModal} />
                        </div>
                    </div>

                    <div className="flex h-full overflow-hidden flex-1">
                        <div className={`border-r border-border min-w-32 max-w-32 md:min-w-48 md:max-w-48 `}>
                            <input
                                type="text"
                                placeholder="Select Chain"
                                className="w-full  p-3 focus:outline-none text-neutral-text bg-black hover:bg-table-odd border-b border-border focus:bg-neutral-900 text-base md:text-sm "
                                onChange={e => {
                                    setSearchChainInput(e.target.value)
                                }}
                            />
                            <div className="flex flex-col p-1 bg-black overflow-y-auto h-full ">
                                {filteredchainList &&
                                    filteredchainList.length > 0 &&
                                    filteredchainList.map(chain => {
                                        return (
                                            <button
                                                key={chain.id}
                                                className={`w-full p-2 h-10 min-h-10 flex items-center gap-2 hover:bg-table-odd apply-transition text-left rounded-lg ${
                                                    selectedChain?.id === chain.id ? 'bg-neutral-900' : ''
                                                }`}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectChain(chain)
                                                }}
                                            >
                                                <div
                                                    className={`rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                                                >
                                                    <Image
                                                        src={
                                                            chain.id
                                                                ? `https://assets.relay.link/icons/square/${chain.id}/dark.png`
                                                                : TOKEN_PLACEHOLDER_IMAGE
                                                        }
                                                        alt={`${chain.displayName} logo`}
                                                        width={100}
                                                        height={100}
                                                        className=" w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                                <span> {chain.displayName}</span>
                                            </button>
                                        )
                                    })}
                            </div>
                        </div>

                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Select Token"
                                value={searchTokenInput}
                                className="w-full  p-3 focus:outline-none text-neutral-text bg-black hover:bg-table-odd border-b border-border focus:bg-neutral-900 text-base md:text-sm "
                                onChange={e => {
                                    setSearchTokenInput(e.target.value)
                                }}
                            />
                            <div className="overflow-y-auto h-full flex flex-col  p-1">
                                {isCurrenciesLoading || isBalanceLoading ? (
                                    <div className="flex flex-col gap-2 p-2">
                                        {[...Array(10)].map((_, index) => (
                                            <div key={index} className="flex items-center gap-2 animate-pulse">
                                                <div className="w-7 h-7 rounded-full bg-neutral-800"></div>
                                                <div className="h-4 w-24 bg-neutral-800 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    tokenList.map(token => {
                                        const tokenBalance = findTokenBalance(token, userBalances)

                                        return (
                                            <button
                                                key={token.address}
                                                className={`w-full h-10 min-h-10 p-2 flex items-center justify-between hover:bg-table-odd apply-transition text-left rounded-lg ${
                                                    token?.address === selectedToken?.address ? 'bg-neutral-900' : ''
                                                }`}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectToken(token)
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`rounded-full border border-border bg-neutral-900 overflow-hidden relative flex items-center justify-center min-w-7 min-h-7 max-w-7 max-h-7`}
                                                    >
                                                        <Image
                                                            src={token?.metadata?.logoURI ?? TOKEN_PLACEHOLDER_IMAGE}
                                                            alt={`${token.name} logo`}
                                                            width={100}
                                                            height={100}
                                                            className="w-full h-full object-cover object-center"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{token.name}</span>
                                                        <span className="text-xs text-neutral-400">{token.symbol}</span>
                                                    </div>
                                                </div>

                                                {tokenBalance && (
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm">{getReadableNumber(tokenBalance.balance, 3, token.symbol)}</span>
                                                        <span className="text-xs text-neutral-400">
                                                            ${getReadableNumber(tokenBalance.usd_value, 3)}
                                                        </span>
                                                    </div>
                                                )}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        )
    }
)

RelayBridgeChainTokenModal.displayName = 'RelayBridgeChainTokenModal'

export default RelayBridgeChainTokenModal
