import React, { useMemo, useRef, useCallback, memo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useLogin, usePrivy } from '@privy-io/react-auth'
import { useWebDataContext } from '@/context/webDataContext'
import TableRowLoading from '../TableRowLoading'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { RxExternalLink } from 'react-icons/rx'
import Link from 'next/link'
import useControlledScroll from '@/hooks/useControlledScroll'
import TransferFundsModal from '../modal/TransferFundsModal'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import Button from '../ui/Button'
import HyperliquidExchangeModal, { HyperliquidExchangeModalMethods } from '../modal/HyperliquidExchangeModal'
import useIsMobile from '@/hooks/useIsMobile'
import Spinner from '../Spinner'

interface Balance {
    coin: string
    total: string
    entryNtl?: string
    tokenId?: string
}

interface TokenData {
    name: string
    markPx: string
    tokenId?: string
}

const TABLE_HEADERS = [
    { label: 'Coin', align: 'left', underline: false },
    { label: 'Total Balance', align: 'center', underline: false },
    { label: 'Available Balance', align: 'center', underline: false },
    { label: 'USDC Value', align: 'center', underline: false },
    { label: 'PNL(ROE%)', align: 'center', underline: true },
    { label: 'Transfer', align: 'center', underline: false },
    { label: 'Contract', align: 'center', underline: false },
] as const

// Extract balance calculation logic
const calculateBalanceMetrics = (balance: Balance, tokenData: TokenData | undefined) => {
    const total = parseFloat(balance.total)
    const markPx = tokenData ? parseFloat(tokenData.markPx) : 0
    const isUSDC = balance.coin === 'USDC'
    const usdcValue = isUSDC ? total.toFixed(2) : (total * markPx).toFixed(2)
    const entryValue = parseFloat(balance.entryNtl || '0')
    const currentValue = parseFloat(usdcValue)

    return {
        ...balance,
        ...tokenData,
        name: isUSDC ? 'USDC (Spot)' : tokenData?.name,
        available: Math.max(0, total),
        usdcValue,
        pnl: isUSDC ? '' : (currentValue - entryValue).toFixed(2),
        roe: isUSDC || entryValue === 0 ? '0.00' : (((currentValue - entryValue) / entryValue) * 100).toFixed(2),
    }
}

// Extract table row component
// eslint-disable-next-line react/display-name
const BalanceRow = memo(
    ({
        balance,
        onTransferClick,
        onRowClick,
        onTopUpClick,
        hideSpotBalance = false,
        isMobile,
    }: {
        balance: ReturnType<typeof calculateBalanceMetrics>
        onTransferClick: (type: 'spot' | 'perp') => void
        onRowClick: (tokenId: string, coin: string) => void
        onTopUpClick?: () => void
        hideSpotBalance?: boolean
        isMobile: boolean
    }) => {
        const pnlValue = parseFloat(balance.pnl)
        const pnlClass = pnlValue > 0 ? 'text-positive' : pnlValue < 0 ? 'text-negative' : ''

        if (!isMobile)
            return (
                <tr
                    className="bg-table-even border-b border-border/80 apply-transition relative cursor-pointer"
                    onClick={() => balance.tokenId && onRowClick(balance.tokenId, balance.coin)}
                >
                    <td className="py-3 px-4 text-left">{balance.name}</td>
                    <td className="py-1 px-4 text-center">
                        {getReadableNumber(Number(balance.total), countDecimalPlaces(Number(balance.total)), '')}
                        &nbsp;&nbsp;{balance.coin}
                    </td>
                    <td className="py-1 px-4 text-center">
                        {getReadableNumber(Number(balance.available), countDecimalPlaces(Number(balance.available)), '')}
                        &nbsp;&nbsp;{balance.coin}
                    </td>
                    <td className="py-1 px-4 text-center">${getReadableNumber(Number(balance.usdcValue), 2)}</td>
                    {!hideSpotBalance && (
                        <>
                            <td className="py-1 px-4 text-center ">
                                {balance.pnl && (
                                    <div className="flex items-center justify-center flex-col">
                                        <span className={pnlClass}>
                                            {pnlValue > 0 ? '+' : ''}
                                            {balance.pnl} ({parseFloat(balance.roe) > 0 ? '+' : ''}
                                            {balance.roe}%)
                                        </span>
                                        {/* <RxExternalLink className="!text-positive" /> */}
                                    </div>
                                )}
                            </td>

                            <td className="py-1 px-4">
                                <div className=" flex gap-2 justify-center items-center">
                                    {balance.name === 'USDC (Spot)' && (
                                        <Button
                                            variant="neutral"
                                            className="text-2xs"
                                            height="min-h-7"
                                            padding="px-2"
                                            onClick={e => {
                                                e.stopPropagation()
                                                onTransferClick('spot')
                                            }}
                                        >
                                            Transfer to Perps
                                        </Button>
                                    )}
                                    {balance.name === 'USDC (Perp)' && (
                                        <div className="flex flex-row flex-wrap gap-2 h-full flex-1 justify-center items-center">
                                            <Button
                                                variant="neutral"
                                                className="text-2xs"
                                                height="min-h-7"
                                                padding="px-2"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    onTransferClick('perp')
                                                }}
                                            >
                                                Transfer to Spot
                                            </Button>

                                            <Button
                                                variant="neutral"
                                                className="text-2xs"
                                                height="min-h-7"
                                                padding="px-2"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    onTopUpClick?.()
                                                }}
                                            >
                                                Top Up
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </td>

                            <td className="py-1 px-4 ">
                                {balance.tokenId && (
                                    <div className="flex gap-1 justify-center items-center">
                                        <Link
                                            href={`https://app.hyperliquid.xyz/explorer/token/${balance.tokenId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 hover:underline"
                                        >
                                            <span> {`${balance.tokenId.slice(0, 5)}...${balance.tokenId.slice(-4)}`}</span>
                                            <RxExternalLink className="" />
                                        </Link>
                                    </div>
                                )}
                            </td>
                        </>
                    )}
                </tr>
            )

        if (isMobile)
            return (
                <div
                    className="bg-table-even border-b border-border apply-transition relative cursor-pointer py-2"
                    onClick={() => balance.tokenId && onRowClick(balance.tokenId, balance.coin)}
                >
                    <div className="flex items-center justify-between px-3">
                        <div className="pt-1 text-left text-sm font-bold">{balance.name}</div>
                        {balance.pnl && (
                            <div className="flex flex-col items-end">
                                <span className="text-2xs text-neutral-text-dark">PNL (ROE %)</span>
                                <span className={`${pnlClass} text-sm font-bold`}>
                                    {pnlValue > 0 ? '+' : ''}
                                    {balance.pnl} ({parseFloat(balance.roe) > 0 ? '+' : ''}
                                    {balance.roe}%)
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 pt-1">
                        <div className="py-1 px-3 flex flex-col">
                            <span className="text-2xs text-neutral-text-dark">Total Balance</span>
                            {getReadableNumber(Number(balance.total), countDecimalPlaces(Number(balance.total)), '')}
                            &nbsp;&nbsp;{balance.coin}
                        </div>
                        <div className="py-1 px-3 flex flex-col">
                            <span className="text-2xs text-neutral-text-dark">Available Balance</span>
                            {getReadableNumber(Number(balance.available), countDecimalPlaces(Number(balance.available)), '')}
                            &nbsp;&nbsp;{balance.coin}
                        </div>
                        <div className="py-1 px-3 flex flex-col items-end">
                            <span className="text-2xs text-neutral-text-dark">USD Value</span>
                            <span>${getReadableNumber(Number(balance.usdcValue), 2)}</span>
                        </div>
                        {!hideSpotBalance && (
                            <div className="flex items-center col-span-full pt-0 px-3">
                                <div className="py-1 text-center flex  flex-col w-full">
                                    {balance.name === 'USDC (Spot)' && (
                                        <Button
                                            variant="neutral"
                                            className="text-2xs w-1/2"
                                            height="min-h-7"
                                            padding="px-2"
                                            onClick={e => {
                                                e.stopPropagation()
                                                onTransferClick('spot')
                                            }}
                                        >
                                            Transfer to Perps
                                        </Button>
                                    )}
                                    {balance.name === 'USDC (Perp)' && (
                                        <div className="flex gap-2 h-full flex-1 justify-center items-center">
                                            <Button
                                                variant="neutral"
                                                className="text-2xs w-1/2"
                                                height="min-h-7"
                                                padding="px-2"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    onTransferClick('perp')
                                                }}
                                            >
                                                Transfer to Spot
                                            </Button>

                                            <Button
                                                variant="neutral"
                                                className="text-2xs w-1/2"
                                                height="min-h-7"
                                                padding="px-2"
                                                onClick={e => {
                                                    e.stopPropagation()
                                                    onTopUpClick?.()
                                                }}
                                            >
                                                Top Up
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {/* <div className="py-1  flex gap-2 justify-center items-center">
                                    {balance.tokenId && (
                                        <>
                                            {`${balance.tokenId.slice(0, 6)}...${balance.tokenId.slice(-4)}`}
                                            <Link
                                                href={`https://app.hyperliquid-testnet.xyz/explorer/token/${balance.tokenId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <RxExternalLink className="" />
                                            </Link>
                                        </>
                                    )}
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>
            )
    }
)

const BalancesTable = ({ hideSpotBalance = false }: { hideSpotBalance?: boolean }) => {
    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const router = useRouter()
    const isMobile = useIsMobile()
    const [initialFromAccount, setInitialFromAccount] = useState<'spot' | 'perp'>('spot')

    const { webData2, loadingWebData2 } = useWebDataContext()
    const { spotTokensData } = usePairTokensContext()

    const tableContainerRef = useRef<HTMLDivElement>(null)
    useControlledScroll({ ref: tableContainerRef })

    // Get filtered headers based on hideSpotBalance prop
    const displayHeaders = useMemo(() => {
        if (hideSpotBalance) {
            return [...TABLE_HEADERS.filter(header => !['PNL(ROE%)', 'Transfer', 'Contract'].includes(header.label))]
        }
        return TABLE_HEADERS
    }, [hideSpotBalance])

    // Add ref for TransferFundsModal
    const transferModalRef = useRef<{ toggleModal: () => void }>(null)
    const depositModalRef = useRef<HyperliquidExchangeModalMethods>(null)

    const balances = useMemo(
        () =>
            !webData2?.spotState?.balances || !spotTokensData
                ? []
                : webData2.spotState.balances.map(balance =>
                      calculateBalanceMetrics(
                          balance,
                          spotTokensData.find(token => token.name === balance.coin)
                      )
                  ),
        [spotTokensData, webData2?.spotState?.balances]
    )

    const handleRowClick = useCallback(
        (tokenId: string, coin: string) => {
            if (!tokenId) return
            router.push(`/perps/${tokenId}?coin=${coin}`)
        },
        [router]
    )

    const handleTopUp = () => {
        if (depositModalRef.current) {
            depositModalRef.current.toggleModal()
        }
    }

    if (!ready || !authenticated) {
        return (
            <div className="flex flex-col min-h-[60vh] max-h-[60vh] relative">
                <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
                    <button type="button" onClick={handleSignIn} className=" underline ">
                        Sign in
                    </button>
                    <span>{`to see your position`}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full max-h-full relative flex-1 overflow-hidden">
            {!isMobile && (
                <div ref={tableContainerRef} className="overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                    <table className="table-auto w-full">
                        <thead className="w-full sticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                            <tr className="w-full text-neutral-text-dark relative">
                                {displayHeaders.map(({ label, align, underline }) => (
                                    <th key={label} className={`py-3 text-xs px-4 text-nowrap text-${align} ${underline ? 'underline' : ''}`}>
                                        {label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        {loadingWebData2 ? (
                            <TableRowLoading totalTableData={7} totalRow={15} className="px-2 items-center" />
                        ) : (
                            <tbody className="w-full text-xs">
                                {webData2 && (
                                    <BalanceRow
                                        isMobile={isMobile}
                                        balance={{
                                            coin: 'USDC',
                                            total: webData2.clearinghouseState.marginSummary.accountValue,
                                            name: 'USDC (Perp)',
                                            markPx: '1',
                                            usdcValue: webData2.clearinghouseState?.crossMarginSummary?.accountValue,
                                            pnl: '',
                                            roe: '0.00',
                                            available: Math.max(
                                                0,
                                                Number(webData2?.clearinghouseState?.marginSummary?.accountValue ?? 0) -
                                                    Number(webData2?.clearinghouseState?.marginSummary?.totalMarginUsed ?? 0)
                                            ),
                                        }}
                                        onTransferClick={type => {
                                            setInitialFromAccount(type)
                                            transferModalRef.current?.toggleModal()
                                        }}
                                        onRowClick={handleRowClick}
                                        onTopUpClick={handleTopUp}
                                        hideSpotBalance={hideSpotBalance}
                                    />
                                )}

                                {!hideSpotBalance && (
                                    <>
                                        {/* Show USDC Spot row only if it doesn't already exist in balances */}
                                        {!balances.some(b => b.name === 'USDC (Spot)') && (
                                            <BalanceRow
                                                isMobile={isMobile}
                                                balance={{
                                                    coin: 'USDC',
                                                    total: '0.0',
                                                    name: 'USDC (Spot)',
                                                    markPx: '1',
                                                    usdcValue: webData2?.spotState?.balances.find(balance => balance.coin === 'USDC')?.total ?? '0',
                                                    pnl: '',
                                                    roe: '0.00',
                                                    available: Number(
                                                        webData2?.spotState?.balances.find(balance => balance.coin === 'USDC')?.total ?? 0
                                                    ),
                                                }}
                                                onTransferClick={type => {
                                                    setInitialFromAccount(type)
                                                    transferModalRef.current?.toggleModal()
                                                }}
                                                onRowClick={handleRowClick}
                                                hideSpotBalance={hideSpotBalance}
                                            />
                                        )}
                                        {balances.map(balance => (
                                            <BalanceRow
                                                isMobile={isMobile}
                                                key={balance.coin}
                                                balance={balance}
                                                onTransferClick={type => {
                                                    setInitialFromAccount(type)
                                                    transferModalRef.current?.toggleModal()
                                                }}
                                                onRowClick={handleRowClick}
                                                onTopUpClick={balance.name === 'USDC (Spot)' ? handleTopUp : undefined}
                                                hideSpotBalance={hideSpotBalance}
                                            />
                                        ))}
                                    </>
                                )}
                            </tbody>
                        )}
                    </table>
                </div>
            )}

            {isMobile && (
                <div className="w-full flex-1 overflow-y-auto h-full mobile-no-scrollbar">
                    {loadingWebData2 ? (
                        <div className="flex items-center justify-center w-full p-3">
                            <Spinner className=" text-xs" />
                        </div>
                    ) : (
                        <div className="w-full text-xs">
                            {webData2 && (
                                <BalanceRow
                                    isMobile={isMobile}
                                    balance={{
                                        coin: 'USDC',
                                        total: webData2.clearinghouseState.marginSummary.accountValue,
                                        name: 'USDC (Perp)',
                                        markPx: '1',
                                        usdcValue: webData2.clearinghouseState?.crossMarginSummary?.accountValue,
                                        pnl: '',
                                        roe: '0.00',
                                        available: Math.max(
                                            0,
                                            Number(webData2?.clearinghouseState?.marginSummary?.accountValue ?? 0) -
                                                Number(webData2?.clearinghouseState?.marginSummary?.totalMarginUsed ?? 0)
                                        ),
                                    }}
                                    onTransferClick={type => {
                                        setInitialFromAccount(type)
                                        transferModalRef.current?.toggleModal()
                                    }}
                                    onRowClick={handleRowClick}
                                    onTopUpClick={handleTopUp}
                                    hideSpotBalance={hideSpotBalance}
                                />
                            )}

                            {!hideSpotBalance && (
                                <>
                                    {/* Show USDC Spot row only if it doesn't already exist in balances */}
                                    {!balances.some(b => b.name === 'USDC (Spot)') && (
                                        <BalanceRow
                                            isMobile={isMobile}
                                            balance={{
                                                coin: 'USDC',
                                                total: '0.0',
                                                name: 'USDC (Spot)',
                                                markPx: '1',
                                                usdcValue: webData2?.spotState?.balances.find(balance => balance.coin === 'USDC')?.total ?? '0',
                                                pnl: '',
                                                roe: '0.00',
                                                available: Number(webData2?.spotState?.balances.find(balance => balance.coin === 'USDC')?.total ?? 0),
                                            }}
                                            onTransferClick={type => {
                                                setInitialFromAccount(type)
                                                transferModalRef.current?.toggleModal()
                                            }}
                                            onRowClick={handleRowClick}
                                            hideSpotBalance={hideSpotBalance}
                                        />
                                    )}
                                    {balances.map(balance => (
                                        <BalanceRow
                                            isMobile={isMobile}
                                            key={balance.coin}
                                            balance={balance}
                                            onTransferClick={type => {
                                                setInitialFromAccount(type)
                                                transferModalRef.current?.toggleModal()
                                            }}
                                            onRowClick={handleRowClick}
                                            onTopUpClick={balance.name === 'USDC (Spot)' ? handleTopUp : undefined}
                                            hideSpotBalance={hideSpotBalance}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

            <TransferFundsModal
                ref={transferModalRef}
                initialFromAccount={initialFromAccount}
                onClose={() => transferModalRef.current?.toggleModal()}
            />

            <HyperliquidExchangeModal ref={depositModalRef} initialShowTopUpAddress={true} />
        </div>
    )
}

export default BalancesTable
