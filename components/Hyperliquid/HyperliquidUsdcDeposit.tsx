import React, { useState } from 'react'
import Image from 'next/image'
import Button from '../ui/Button'
import { QRCodeSVG } from 'qrcode.react'
import { useUser } from '@/context/UserContext'
import { toast } from 'react-toastify'
import Spinner from '../Spinner'
import { FaCopy } from 'react-icons/fa'
import Dropdown from '../Dropdown'
import useUserTokenBalanceData from '@/hooks/data/useUserTokenBalance'
import { CRUSH_ETHEREUM_ADDRESS, CRUSH_SOLANA_ADDRESS, USDC_ETHEREUM_ADDRESS, USDC_SOLANA_ADDRESS } from '@/data/default/chains'
import { getChainImage } from '@/utils/image'
import useArbitrumWalletHoldingsData from '@/hooks/data/useArbitrumWalletHoldingsData'
import { getReadableNumber } from '@/utils/price'
import useHaptic from '@/hooks/useHaptic'

type ChainId = 'arb' | 'eth' | 'sol'

interface Chain {
    id: ChainId
    name: string
    logo: string
}

interface Token {
    id: string
    name: string
    logo: string
}

const chains: Chain[] = [
    {
        id: 'arb',
        name: 'Arbitrum',
        logo: 'https://app.hyperliquid.xyz/images/arbitrum.png',
    },
    {
        id: 'eth',
        name: 'Ethereum',
        logo: getChainImage('ethereum'),
    },
    {
        id: 'sol',
        name: 'Solana',
        logo: getChainImage('solana'),
    },
]

const tokens: Record<ChainId, Token[]> = {
    arb: [
        {
            id: 'usdc',
            name: 'USDC',
            logo: 'https://coin-images.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        },
    ],
    eth: [
        // {
        //     id: 'eth',
        //     name: 'ETH',
        //     logo: getChainImage('ethereum'),
        // },
        {
            id: 'usdc',
            name: 'USDC',
            logo: 'https://coin-images.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        },
    ],
    sol: [
        {
            id: 'sol',
            name: 'SOL',
            logo: getChainImage('solana'),
        },
        {
            id: 'usdc',
            name: 'USDC',
            logo: 'https://coin-images.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        },
    ],
}

const HyperliquidUsdcDeposit = () => {
    const { triggerHaptic } = useHaptic()

    const [selectedChain, setSelectedChain] = useState<Chain>(chains[0])
    const [selectedToken, setSelectedToken] = useState<Token>(tokens[selectedChain.id][0])

    const { userPublicWalletAddresses } = useUser()
    const { data: userSolBalanceData, isLoading: isLoadingSol } = useUserTokenBalanceData('solana', CRUSH_SOLANA_ADDRESS, 10000)
    const { data: userEthBalanceData, isLoading: isLoadingEth } = useUserTokenBalanceData('ethereum', CRUSH_ETHEREUM_ADDRESS, 10000)

    const { data: userEthUsdcBalanceData, isLoading: isLoadingEthUsdc } = useUserTokenBalanceData('ethereum', USDC_ETHEREUM_ADDRESS, 10000)
    const { data: userSolUsdcBalanceData, isLoading: isLoadingSolUsdc } = useUserTokenBalanceData('solana', USDC_SOLANA_ADDRESS, 10000)

    const { data: walletHoldings, isLoading: isLoadingWalletHoldings } = useArbitrumWalletHoldingsData(userPublicWalletAddresses['ethereum'])
    const usdcHolding = walletHoldings?.find(holding => holding.token.symbol === 'USDC')

    const handleCopyAddress = () => {
        triggerHaptic(50)
        navigator.clipboard.writeText(userPublicWalletAddresses[selectedChain.id === 'sol' ? 'solana' : 'ethereum'] || '')
        toast.success('Address copied to clipboard successfully.')
    }

    const getChainBalance = (chainId: string) => {
        if (selectedToken.id === 'usdc') {
            switch (chainId) {
                case 'arb':
                    return Number(usdcHolding?.balance ?? 0)
                case 'eth':
                    return userEthUsdcBalanceData ?? 0
                case 'sol':
                    return userSolUsdcBalanceData ?? 0
                default:
                    return 0
            }
        } else {
            switch (chainId) {
                case 'sol':
                    return userSolBalanceData ?? 0
                case 'eth':
                    return userEthBalanceData ?? 0
                default:
                    return 0
            }
        }
    }

    const isLoading = (chainId: string) => {
        if (selectedToken.id === 'usdc') {
            switch (chainId) {
                case 'arb':
                    return isLoadingWalletHoldings
                case 'eth':
                    return isLoadingEthUsdc
                case 'sol':
                    return isLoadingSolUsdc
                default:
                    return false
            }
        } else {
            switch (chainId) {
                case 'sol':
                    return isLoadingSol
                case 'eth':
                    return isLoadingEth
                default:
                    return false
            }
        }
    }

    const chainDropdownOptions = chains.map(chain => ({
        label: (
            <div className="flex items-center gap-2">
                <Image src={chain.logo} alt={`${chain.name} Logo`} width={20} height={20} />
                {chain.name}
            </div>
        ),
        value: chain,
    }))

    const tokenDropdownOptions = tokens[selectedChain.id].map(token => ({
        label: (
            <div className="flex items-center gap-2">
                <Image src={token.logo} alt={`${token.name} Logo`} width={20} height={20} />
                {token.name}
            </div>
        ),
        value: token,
    }))

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 relative">
                <Dropdown
                    placeholder="Select Chain"
                    options={chainDropdownOptions}
                    selectedOption={chainDropdownOptions.find(opt => opt.value.id === selectedChain.id)}
                    onChange={(option: { value: Chain }) => {
                        setSelectedChain(option.value)
                        setSelectedToken(tokens[option.value.id][0])
                    }}
                />

                <Dropdown
                    placeholder="Select Token"
                    options={tokenDropdownOptions}
                    selectedOption={tokenDropdownOptions.find(opt => opt.value.id === selectedToken.id)}
                    onChange={(option: { value: Token }) => setSelectedToken(option.value)}
                />
            </div>

            <div className="w-full flex justify-between p-2 bg-table-odd rounded-lg text-neutral-text border border-border">
                <span className="text-neutral-text-dark">Balance: </span>
                <span>
                    {isLoading(selectedChain.id) ? (
                        <Spinner />
                    ) : (
                        `${getReadableNumber(Number(getChainBalance(selectedChain.id)), 3)} ${selectedToken.name}`
                    )}
                </span>
            </div>

            <p className="text-neutral-text-dark text-xs ">
                Top up your Crush Wallet with any supported token to start crosschain trading instantly.
            </p>
            <div className="bg-table-odd rounded-lg p-3 border border-border">
                <div className="flex flex-row items-center gap-3">
                    <div className=" rounded-md p-3 border border-border bg-table-even">
                        <QRCodeSVG
                            value={userPublicWalletAddresses[selectedChain.id === 'sol' ? 'solana' : 'ethereum'] || ''}
                            bgColor="#101010"
                            fgColor="#dddddd"
                            size={100}
                        />
                    </div>

                    <div className="flex flex-col justify-center pb-3">
                        <p className="text-neutral-text-dark pb-1">Deposit Address</p>
                        <div className="flex items-center gap-3">
                            <div className="text-sm break-all font-semibold">
                                {userPublicWalletAddresses[selectedChain.id === 'sol' ? 'solana' : 'ethereum'] || 'No address available'}
                            </div>
                            <button onClick={handleCopyAddress} className=" hover:opacity-80 transition-opacity flex justify-items-end">
                                <FaCopy className="text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Button onClick={handleCopyAddress} variant="primary" className="text-sm" height="min-h-10 max-h-10">
                <span>Copy</span>
                {isLoading(selectedChain.id) && <Spinner variant="primary" className="" />}
            </Button>
        </div>
    )
}

export default HyperliquidUsdcDeposit
