import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '@/context/UserContext'
import TableRowLoading from '../TableRowLoading'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import useUserTokenHoldingsData from '@/hooks/data/useUserTokenHoldingsData'
import Image from 'next/image'
import { getChainImage } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import useIsMobile from '@/hooks/useIsMobile'
import { useRouter, useSearchParams } from 'next/navigation'
import { mainCurrencyChainAddresses } from '@/data/default/chains'
import { sortUserTokenHoldings } from '@/utils/wallet'
import PercentageChange from '../PercentageChange'
import HoldingPanel from '../panel/HoldingPanel'
import useControlledScroll from '@/hooks/useControlledScroll'
import SharePositionModal from '../modal/SharePositionModal'
import ImageFallback from '../ImageFallback'
import { usePendingTransactions } from '@/context/PendingTransactionsContext'
import Spinner from '../Spinner'
import EmptyData from '../global/EmptyData'
import { HiExternalLink } from 'react-icons/hi'
import { usePairTokensContext } from '@/context/pairTokensContext'

const MyPositionsTab = ({ containerHeight = 'min-h-[60vh] max-h-[60vh]' }: { containerHeight?: string }) => {
    const { userPublicWalletAddresses, setLastSelectedToken } = useUser()
    const { solTokenPrice, ethTokenPrice } = usePairTokensContext()
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const isMobile = useIsMobile()

    const router = useRouter()
    const searchParams = useSearchParams()
    const selectedAddress = searchParams.get('address')

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    const [showHoldingDetailPanel, setShowHoldingDetailPanel] = useState(false)
    const [isTokenHoldingsLoading, setIsTokenHoldingsLoading] = useState(true)
    const [showShareModal, setShowShareModal] = useState(false)
    const [selectedHolding, setSelectedHolding] = useState<UserTokenHolding | undefined>(undefined)

    const {
        data: userSolanaTokenHoldings,
        isLoading: isUserSolanaTokenHoldingsRefetching,
        isFetched: isUserSolanaTokenHoldingsFetched,
    } = useUserTokenHoldingsData('solana', userPublicWalletAddresses['solana'])

    const {
        data: userEthereumTokenHoldings,
        isLoading: isUserEthereumTokenHoldingsRefetching,
        isFetched: isUserEthereumTokenHoldingsFetched,
    } = useUserTokenHoldingsData('ethereum', userPublicWalletAddresses['ethereum'])

    const {
        data: userBaseTokenHoldings,
        isLoading: isUserBaseTokenHoldingsRefetching,
        isFetched: isUserBaseTokenHoldingsFetched,
    } = useUserTokenHoldingsData('base', userPublicWalletAddresses['ethereum'])

    const [userTokenHoldings, setUserTokenHoldings] = useState<UserTokenHoldings>([])

    const { pendingTransactions } = usePendingTransactions()

    useEffect(() => {
        if (isUserSolanaTokenHoldingsRefetching || isUserEthereumTokenHoldingsRefetching || isUserBaseTokenHoldingsRefetching) {
            setIsTokenHoldingsLoading(true)
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

                setUserTokenHoldings(sortedHoldings)
            }
            setIsTokenHoldingsLoading(false)
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
        if (userTokenHoldings && userTokenHoldings.length > 0 && selectedAddress) {
            const holding = userTokenHoldings.find(holding => holding?.token?.address === selectedAddress)
            if (holding) {
                setSelectedHolding(holding)
                setShowHoldingDetailPanel(true)
            }
        }
    }, [userTokenHoldings, selectedAddress])

    return (
        <div className={`flex flex-col  relative ${containerHeight} overflow-hidden`}>
            {ready && authenticated ? (
                <>
                    {/* positions  */}
                    {!isMobile && (
                        <div ref={tableContainerRef} className="  overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                            <table className=" table-auto w-full h-full ">
                                <thead className=" w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                                    <tr className="w-full text-neutral-text-dark relative">
                                        <th className="py-3 text-xs px-4 text-nowrap text-left">
                                            Token <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                                        </th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Holdings</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Value</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Total Profit</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Bought/AVG</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Sold/AVG</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">AVG BUY MCAP</th>
                                        <th className="py-3 text-xs px-4 text-nowrap">Share</th>
                                    </tr>
                                </thead>
                                {isTokenHoldingsLoading ? (
                                    <TableRowLoading totalTableData={8} totalRow={15} className="px-2 items-center" />
                                ) : (
                                    <tbody className="w-full text-xs">
                                        {/* Render pending transactions first */}
                                        {pendingTransactions.map((pendingTx, index) => {
                                            if (pendingTx.status === 'pending') {
                                                return (
                                                    <tr
                                                        key={`pending-${index}`}
                                                        className="bg-table-even border-b border-border/80 apply-transition relative animate-pulse"
                                                    >
                                                        <td className="py-3">
                                                            <div className="flex items-center justify-start gap-2 h-full pl-2">
                                                                <div className="bg-black rounded-full border border-border relative flex items-center justify-center min-w-8 min-h-8 max-w-8 max-h-8">
                                                                    <ImageFallback
                                                                        src={pendingTx.token.logo ?? ''}
                                                                        alt={`${pendingTx.token.symbol} logo`}
                                                                        width={100}
                                                                        height={100}
                                                                        className="rounded-full"
                                                                    />
                                                                    <div className="absolute w-[13px] h-[13px] min-w-[13px] flex items-center justify-center min-h-[13px] overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                        <Image
                                                                            src={getChainImage(pendingTx.chain as ChainId)}
                                                                            alt={`${pendingTx.chain} logo`}
                                                                            width={100}
                                                                            height={100}
                                                                            className="w-full h-full object-cover object-center"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <span>{pendingTx.token.symbol}</span>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="flex flex-col items-center justify-center h-full pl-2">
                                                                <div className="leading-none">
                                                                    {getReadableNumber(
                                                                        Number(pendingTx.estimatedBalance),
                                                                        countDecimalPlaces(Number(pendingTx.estimatedBalance), 2, 2)
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex flex-col items-center justify-center h-full pl-2">
                                                                <div className="leading-none">
                                                                    {pendingTx.chain === 'solana' &&
                                                                        solTokenPrice &&
                                                                        `${getReadableNumber(
                                                                            Number(pendingTx.estimatedValue) / solTokenPrice,
                                                                            countDecimalPlaces(Number(pendingTx.estimatedValue) / solTokenPrice, 2, 2)
                                                                        )} SOL`}

                                                                    {pendingTx.chain === 'ethereum' &&
                                                                        ethTokenPrice &&
                                                                        `${getReadableNumber(
                                                                            Number(pendingTx.estimatedValue) / ethTokenPrice,
                                                                            countDecimalPlaces(Number(pendingTx.estimatedValue) / ethTokenPrice, 2, 2)
                                                                        )} ETH`}
                                                                </div>
                                                                <div className="text-xs leading-none text-neutral-text-dark py-1">
                                                                    {getReadableNumber(
                                                                        Number(pendingTx.estimatedValue),
                                                                        countDecimalPlaces(Number(pendingTx.estimatedValue), 2, 2),
                                                                        '$'
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Fill other columns with placeholder data */}
                                                        <td>
                                                            <div className="flex flex-col items-center justify-center h-full pl-2">
                                                                <div className="leading-none">$0</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex flex-col items-center justify-center h-full pl-2">
                                                                <div className="leading-none">$0</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex flex-col items-center justify-center h-full pl-2">
                                                                <div className="leading-none">$0</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <div className="leading-none">$0</div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="w-full h-full flex items-center justify-center gap-2">
                                                                <div className="leading-none">-</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                        })}

                                        {userTokenHoldings &&
                                            userTokenHoldings.length > 0 &&
                                            userTokenHoldings.map((holding, index) => {
                                                if (holding.balance > 0) {
                                                    return (
                                                        <tr
                                                            onClick={() => {
                                                                if (mainCurrencyChainAddresses.includes(holding?.token?.address)) return

                                                                //set href
                                                                const tokenUrl = getTokenUrl(
                                                                    holding.chain ?? 'solana',
                                                                    holding?.token?.address,
                                                                    isMobile
                                                                )

                                                                setLastSelectedToken({
                                                                    address: holding.token.address,
                                                                    chain: holding.chain,
                                                                })
                                                                router.push(`${tokenUrl}`)
                                                            }}
                                                            key={index}
                                                            className={`${
                                                                mainCurrencyChainAddresses.includes(holding?.token?.address)
                                                                    ? ''
                                                                    : 'cursor-pointer hover:bg-table-odd'
                                                            }  bg-table-even  border-b border-border/80 apply-transition relative`}
                                                        >
                                                            <td className="py-3">
                                                                <div className=" flex items-center justify-start gap-2  h-full pl-2">
                                                                    <div
                                                                        className={`bg-black  rounded-full border border-border relative flex items-center justify-center  min-w-8 min-h-8 max-w-8 max-h-8`}
                                                                    >
                                                                        <ImageFallback
                                                                            src={holding?.token?.logo}
                                                                            alt={`${holding?.token?.name} logo`}
                                                                            width={100}
                                                                            height={100}
                                                                            className="rounded-full"
                                                                        />
                                                                        {!mainCurrencyChainAddresses.includes(holding.token?.address) && (
                                                                            <div className="absolute w-[13px] h-[13px] min-w-[13px] flex items-center justify-center min-h-[13px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                                <Image
                                                                                    src={getChainImage(holding.chain)}
                                                                                    alt={`${holding.chain} logo`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className=" w-full h-full object-cover object-center"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span> {holding?.token?.symbol}</span>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className=" flex flex-col items-center justify-center  h-full pl-2 ">
                                                                    <div className="leading-none">
                                                                        {getReadableNumber(
                                                                            holding.balance,
                                                                            countDecimalPlaces(holding.balance, 2, 2)
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className=" flex flex-col items-center justify-center  h-full pl-2 ">
                                                                    <div className="  leading-none text-center">
                                                                        {holding.chain === 'solana' &&
                                                                            solTokenPrice &&
                                                                            `${getReadableNumber(
                                                                                holding.usd_value / solTokenPrice,
                                                                                countDecimalPlaces(holding.usd_value / solTokenPrice, 2, 2)
                                                                            )} SOL`}

                                                                        {holding.chain === 'ethereum' &&
                                                                            ethTokenPrice &&
                                                                            `${getReadableNumber(
                                                                                holding.usd_value / ethTokenPrice,
                                                                                countDecimalPlaces(holding.usd_value / ethTokenPrice, 2, 2)
                                                                            )} ETH`}
                                                                    </div>
                                                                    <div className="text-xs leading-none text-neutral-text-dark py-1 text-center">
                                                                        {getReadableNumber(
                                                                            holding.usd_value,
                                                                            countDecimalPlaces(holding.usd_value, 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className=" flex flex-col items-center justify-center  h-full pl-2">
                                                                    <div
                                                                        className={`leading-none ${
                                                                            holding.total_profit < 0
                                                                                ? 'text-negative'
                                                                                : holding.total_profit > 0
                                                                                ? 'text-positive'
                                                                                : 'text-neutral-text'
                                                                        }`}
                                                                    >
                                                                        {getReadableNumber(
                                                                            Math.abs(holding.total_profit),
                                                                            countDecimalPlaces(Math.abs(holding.total_profit), 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                    <div className="text-2xs  leading-none text-neutral-text-dark">
                                                                        <PercentageChange size="small" percentage={holding.total_profit_pnl} />
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            <td>
                                                                <div className=" flex flex-col items-center justify-center  h-full pl-2 ">
                                                                    <div className="leading-none">
                                                                        {getReadableNumber(
                                                                            holding.history_bought_cost,
                                                                            countDecimalPlaces(holding.history_bought_cost, 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs leading-none text-neutral-text-dark py-1">
                                                                        {getReadableNumber(
                                                                            holding.avg_cost,
                                                                            countDecimalPlaces(holding.avg_cost, 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className=" flex flex-col items-center justify-center  h-full pl-2 ">
                                                                    <div className="leading-none">
                                                                        {getReadableNumber(
                                                                            holding.history_sold_income,
                                                                            countDecimalPlaces(holding.history_sold_income, 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs leading-none text-neutral-text-dark py-1">
                                                                        {getReadableNumber(
                                                                            holding.avg_sold,
                                                                            countDecimalPlaces(holding.avg_sold, 2, 2),
                                                                            '$'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    {holding ? <>{getReadableNumber(holding.avg_bought_mcap ?? 0, 2, '$')}</> : '-'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {!mainCurrencyChainAddresses.includes(holding?.token?.address) ? (
                                                                    <div className="w-full h-full flex items-center justify-center gap-2 ">
                                                                        <button
                                                                            type="button"
                                                                            className=" p-[2px]"
                                                                            onClick={e => {
                                                                                e.stopPropagation()
                                                                                setShowShareModal(true)
                                                                                setSelectedHolding(holding)
                                                                            }}
                                                                        >
                                                                            <HiExternalLink />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center gap-2">-</div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    )
                                                }
                                            })}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    )}

                    {isMobile && (
                        <div className="w-full flex-1 overflow-y-auto h-full mobile-no-scrollbar flex flex-col">
                            {isTokenHoldingsLoading ? (
                                <div className="flex items-center justify-center w-full p-3 flex-1">
                                    <Spinner className=" text-xs" />
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1">
                                    {userTokenHoldings && userTokenHoldings.length > 0 ? (
                                        <>
                                            {pendingTransactions.map((pendingTx, index) => {
                                                if (pendingTx.status === 'pending') {
                                                    return (
                                                        <div
                                                            key={`pending-${index}`}
                                                            className={` bg-table-even  border-b border-border/80 apply-transition relative flex flex-col p-3 animate-pulse`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className=" flex items-center justify-start gap-2  h-full">
                                                                    <div
                                                                        className={`bg-black  rounded-full border border-border relative flex items-center justify-center  min-w-8 min-h-8 max-w-8 max-h-8`}
                                                                    >
                                                                        <ImageFallback
                                                                            src={pendingTx.token.logo ?? ''}
                                                                            alt={`${pendingTx.token.symbol} logo`}
                                                                            width={100}
                                                                            height={100}
                                                                            className="rounded-full"
                                                                        />

                                                                        <div className="absolute w-[13px] h-[13px] min-w-[13px] flex items-center justify-center min-h-[13px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                            <Image
                                                                                src={getChainImage(pendingTx.chain as ChainId)}
                                                                                alt={`${pendingTx.chain} logo`}
                                                                                width={100}
                                                                                height={100}
                                                                                className=" w-full h-full object-cover object-center"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <span> {pendingTx?.token?.symbol}</span>
                                                                </div>

                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-2xs text-neutral-text-dark">PNL (ROE %)</span>
                                                                    <div className={`flex items-center gap-1  font-bold `}>
                                                                        <div className={`leading-none `}>$0</div>
                                                                        <div className="text-2xs leading-none  flex items-center">( 0.00% )</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 pt-1">
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Holding</span>
                                                                    <div className="text-xs">
                                                                        {getReadableNumber(
                                                                            Number(pendingTx.estimatedBalance),
                                                                            countDecimalPlaces(Number(pendingTx.estimatedBalance), 2, 2)
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Value</span>
                                                                    <div className="text-xs">
                                                                        <div className="  leading-none ">
                                                                            {pendingTx.chain === 'solana' &&
                                                                                solTokenPrice &&
                                                                                `${getReadableNumber(
                                                                                    Number(pendingTx.estimatedValue) / solTokenPrice,
                                                                                    countDecimalPlaces(
                                                                                        Number(pendingTx.estimatedValue) / solTokenPrice,
                                                                                        2,
                                                                                        2
                                                                                    )
                                                                                )} SOL`}

                                                                            {pendingTx.chain === 'ethereum' &&
                                                                                ethTokenPrice &&
                                                                                `${getReadableNumber(
                                                                                    Number(pendingTx.estimatedValue) / ethTokenPrice,
                                                                                    countDecimalPlaces(
                                                                                        Number(pendingTx.estimatedValue) / ethTokenPrice,
                                                                                        2,
                                                                                        2
                                                                                    )
                                                                                )} ETH`}
                                                                        </div>
                                                                        <div className="text-xs leading-none text-neutral-text-dark py-1 ">
                                                                            {getReadableNumber(
                                                                                Number(pendingTx.estimatedValue),
                                                                                countDecimalPlaces(Number(pendingTx.estimatedValue), 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col items-end">
                                                                    <span className="text-2xs text-neutral-text-dark text-right">Bought/AVG</span>
                                                                    <div className="text-xs text-right">-</div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Sold/AVG</span>
                                                                    <div className="text-xs">-</div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">AVG Buy MCAP</span>
                                                                    <div className="text-xs">-</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                            {userTokenHoldings.map((holding, index) => {
                                                if (holding.balance > 0) {
                                                    return (
                                                        <div
                                                            onClick={() => {
                                                                if (mainCurrencyChainAddresses.includes(holding?.token?.address)) return

                                                                //set href
                                                                const tokenUrl = getTokenUrl(
                                                                    holding.chain ?? 'solana',
                                                                    holding?.token?.address,
                                                                    isMobile
                                                                )

                                                                setLastSelectedToken({
                                                                    address: holding.token.address,
                                                                    chain: holding.chain,
                                                                })
                                                                router.push(`${tokenUrl}`)
                                                            }}
                                                            key={index}
                                                            className={`${
                                                                mainCurrencyChainAddresses.includes(holding?.token?.address)
                                                                    ? ''
                                                                    : 'cursor-pointer hover:bg-table-odd'
                                                            }  bg-table-even  border-b border-border/80 apply-transition relative flex flex-col px-3 py-2`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className=" flex items-center justify-start gap-2  h-full">
                                                                    <div
                                                                        className={`bg-black  rounded-full border border-border relative flex items-center justify-center  min-w-8 min-h-8 max-w-8 max-h-8`}
                                                                    >
                                                                        <ImageFallback
                                                                            src={holding?.token?.logo}
                                                                            alt={`${holding?.token?.name} logo`}
                                                                            width={100}
                                                                            height={100}
                                                                            className="rounded-full"
                                                                        />
                                                                        {!mainCurrencyChainAddresses.includes(holding.token?.address) && (
                                                                            <div className="absolute w-[13px] h-[13px] min-w-[13px] flex items-center justify-center min-h-[13px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
                                                                                <Image
                                                                                    src={getChainImage(holding.chain)}
                                                                                    alt={`${holding.chain} logo`}
                                                                                    width={100}
                                                                                    height={100}
                                                                                    className=" w-full h-full object-cover object-center"
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span> {holding?.token?.symbol}</span>
                                                                </div>

                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-2xs text-neutral-text-dark">PNL (ROE %)</span>
                                                                    <div
                                                                        className={`flex items-center gap-1  font-bold ${
                                                                            holding.total_profit < 0
                                                                                ? 'text-negative'
                                                                                : holding.total_profit > 0
                                                                                ? 'text-positive'
                                                                                : 'text-neutral-text'
                                                                        }`}
                                                                    >
                                                                        <div className={`leading-none `}>
                                                                            {getReadableNumber(
                                                                                Math.abs(holding.total_profit),
                                                                                countDecimalPlaces(Math.abs(holding.total_profit), 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                        <div className="text-2xs leading-none  flex items-center">
                                                                            (
                                                                            <PercentageChange
                                                                                width="w-fit"
                                                                                size="small"
                                                                                percentage={holding.total_profit_pnl}
                                                                            />
                                                                            )
                                                                        </div>

                                                                        {!mainCurrencyChainAddresses.includes(holding?.token?.address) && (
                                                                            <div className="w-full h-full flex items-center justify-center gap-2 ">
                                                                                <button
                                                                                    type="button"
                                                                                    className=" p-[2px] text-xs"
                                                                                    onClick={e => {
                                                                                        e.stopPropagation()
                                                                                        setShowShareModal(true)
                                                                                        setSelectedHolding(holding)
                                                                                    }}
                                                                                >
                                                                                    <HiExternalLink />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 pt-1">
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Holding</span>
                                                                    <div className="text-xs">
                                                                        {getReadableNumber(
                                                                            holding.balance,
                                                                            countDecimalPlaces(holding.balance, 2, 2)
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Value</span>
                                                                    <div className="text-xs">
                                                                        <div className="  leading-none ">
                                                                            {holding.chain === 'solana' &&
                                                                                solTokenPrice &&
                                                                                `${getReadableNumber(
                                                                                    holding.usd_value / solTokenPrice,
                                                                                    countDecimalPlaces(holding.usd_value / solTokenPrice, 2, 2)
                                                                                )} SOL`}

                                                                            {holding.chain === 'ethereum' &&
                                                                                ethTokenPrice &&
                                                                                `${getReadableNumber(
                                                                                    holding.usd_value / ethTokenPrice,
                                                                                    countDecimalPlaces(holding.usd_value / ethTokenPrice, 2, 2)
                                                                                )} ETH`}
                                                                        </div>
                                                                        <div className="text-xs leading-none text-neutral-text-dark py-1 ">
                                                                            {getReadableNumber(
                                                                                holding.usd_value,
                                                                                countDecimalPlaces(holding.usd_value, 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col items-end">
                                                                    <span className="text-2xs text-neutral-text-dark text-right">Bought/AVG</span>
                                                                    <div className="text-xs text-right">
                                                                        <div className="leading-none">
                                                                            {getReadableNumber(
                                                                                holding.history_bought_cost,
                                                                                countDecimalPlaces(holding.history_bought_cost, 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs leading-none text-neutral-text-dark py-1">
                                                                            {getReadableNumber(
                                                                                holding.avg_cost,
                                                                                countDecimalPlaces(holding.avg_cost, 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">Sold/AVG</span>
                                                                    <div className="text-xs">
                                                                        <div className="leading-none">
                                                                            {getReadableNumber(
                                                                                holding.history_sold_income,
                                                                                countDecimalPlaces(holding.history_sold_income, 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                        <div className="text-xs leading-none text-neutral-text-dark py-1">
                                                                            {getReadableNumber(
                                                                                holding.avg_sold,
                                                                                countDecimalPlaces(holding.avg_sold, 2, 2),
                                                                                '$'
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="py-1 flex flex-col">
                                                                    <span className="text-2xs text-neutral-text-dark">AVG Buy MCAP</span>
                                                                    <div className="text-xs">
                                                                        {holding ? (
                                                                            <>{getReadableNumber(holding.avg_bought_mcap ?? 0, 2, '$')}</>
                                                                        ) : (
                                                                            '-'
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </>
                                    ) : (
                                        <EmptyData />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {showHoldingDetailPanel && selectedHolding && (
                        <HoldingPanel
                            toggleHoldingPanel={() => setShowHoldingDetailPanel(false)}
                            userPublicWalletAddresses={userPublicWalletAddresses}
                            chain={selectedHolding.chain}
                            tokenAddress={selectedHolding.token?.address}
                            symbol={selectedHolding.token?.symbol}
                        />
                    )}

                    {showShareModal && <SharePositionModal holding={selectedHolding} handleCloseModal={() => setShowShareModal(false)} />}
                </>
            ) : (
                <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
                    <button type="button" onClick={handleSignIn} className=" underline ">
                        Sign in
                    </button>
                    <span>{`to see your position`}</span>
                </div>
            )}
        </div>
    )
}

export default MyPositionsTab
