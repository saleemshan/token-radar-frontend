'use client'
import React, { useMemo, useRef, useState } from 'react'
import { getTimeComparison } from '@/utils/time'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import PercentageChange from '../PercentageChange'
// import Link from 'next/link';
import TableRowLoading from '../TableRowLoading'
import useTrendingTokensData from '@/hooks/data/useTrendingTokensData'
import FavouriteTokenButton from '../FavouriteTokenButton'
import { useUser } from '@/context/UserContext'
import TokenName from '../TokenName'
import PumpFunLiveGrid from '../PumpFunLiveGrid'
import { PumpFunLiveToken } from '@/hooks/data/usePumpFunLiveData'
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    OnChangeFn,
    Row,
    SortingState,
    useReactTable,
} from '@tanstack/react-table'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { chains } from '@/data/default/chains'
import { getChainImage, TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import { useTrade } from '@/context/TradeContext'
import { tradeSettings } from '@/data/default/tradeSettings'
import { useTradeSettingsData } from '@/hooks/data/useTradeSettingsData'
import { GiElectric } from 'react-icons/gi'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import QuickyBuyInput from '../QuickyBuyInput'
import Link from 'next/link'

const columnHelper = createColumnHelper<Token>()

const TrendingPanel = ({
    columns = [
        'token',
        'created',
        'liq',
        'mcap',
        'holders',
        'txs',
        'volume24h',
        'price',
        'priceChange1h',
        'priceChange24h',
        // 'priceChange5m',
        // 'priceChange6h',
        // 'action',
        'quickBuy',
    ],
    border = true,
    rounded = true,
    showSocials = true,
    showTokenAddress = true,
    showQuickBuy = true,
    showFavouriteButton = true,
    showTableHeaderBorder = false,
    showTableHeader = true,
    percentageStyle = false,
    percentageSize = 'normal',
    isMobile = false,
    size = 'normal',
    enableOverflowX = true,
    showHeader = true,
    showPumpFunBadge = true,
}: {
    columns?: string[]
    border?: boolean
    rounded?: boolean
    showSocials?: boolean
    showHeader?: boolean
    showFavouriteButton?: boolean
    showTableHeaderBorder?: boolean
    showTableHeader?: boolean
    showTokenAddress?: boolean
    percentageStyle?: boolean
    showQuickBuy?: boolean
    enableOverflowX?: boolean
    percentageSize?: 'normal' | 'small'
    path?: string
    queryParams?: boolean
    isMobile?: boolean
    size?: 'normal' | 'small' | 'extra-small'
    showPumpFunBadge?: boolean
}) => {
    const router = useRouter()
    const { authenticated, ready, user } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { handleExecuteTrade } = useTrade()
    const { chain, setLastSelectedToken, setChain } = useUser()
    const pathname = usePathname()

    const { data: tradeSettingsData, isFetched: isTradeSettingsDataFetched } = useTradeSettingsData(chain.api)

    const intervals: TrendingTokensInterval[] = ['1h', '4h', '12h', '24h']
    const [sorting, setSorting] = useState([])
    const [activeInterval, setActiveInterval] = useState<TrendingTokensInterval>(intervals[0])
    const [activeMode, setActiveMode] = useState<'trending' | 'pumpfun-live'>('trending')

    // Auto-switch to trending when chain is not Solana
    React.useEffect(() => {
        if (chain.id !== 'solana' && activeMode === 'pumpfun-live') {
            setActiveMode('trending')
        }
    }, [chain.id, activeMode])

    const { data: trendingTokensData, error, isError } = useTrendingTokensData(chain.api, activeInterval)

    const [showChainOptions, setShowChainOptions] = useState(false)

    const data = useMemo(() => trendingTokensData, [trendingTokensData])

    const tableContainerRef = useRef<HTMLDivElement>(null)

    const datatableColumns = useMemo(
        () => [
            columnHelper.accessor(row => row, {
                id: 'token',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-left ${border ? 'border-b' : ''} border-border`}>Token</div>
                ),
                cell: info => {
                    const tokenData = info.getValue()
                    return (
                        <div className="flex items-center gap-2 px-3 py-2">
                            {showFavouriteButton && <FavouriteTokenButton tokenData={tokenData} stopPropagation />}

                            <TokenName
                                token={tokenData}
                                showSocials={showSocials}
                                showTokenAddress={showTokenAddress}
                                size={size}
                                showLink={true}
                                isMobile={isMobile}
                            />
                        </div>
                    )
                },
            }),
            columnHelper.accessor(row => row, {
                id: 'sidebar',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-left ${border ? 'border-b' : ''} border-border`}>Token</div>
                ),
                cell: info => {
                    const tokenData = info.getValue()
                    return (
                        <div className="flex gap-3 px-3 py-2 items-center select-none bg-table-even  border-b border-border/80 apply-transition cursor-pointer hover:bg-table-odd">
                            {showFavouriteButton && <FavouriteTokenButton tokenData={tokenData} stopPropagation />}
                            <Link
                                onClick={() => {
                                    setLastSelectedToken({
                                        address: tokenData.address,
                                        chain: tokenData.chain_id,
                                    })
                                }}
                                href={getTokenUrl(tokenData.chain_id, tokenData.address, isMobile)}
                                className="flex items-center justify-center gap-3 w-full"
                            >
                                <div className="relative">
                                    <div className="bg-black min-w-8 min-h-8 max-w-8 max-h-8 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                                        {tokenData.image.icon && tokenData.image.icon.includes('https') && (
                                            <Image
                                                src={tokenData.image.icon ?? TOKEN_PLACEHOLDER_IMAGE}
                                                alt={`${tokenData.name} logo`}
                                                width={200}
                                                height={200}
                                                className=" w-full h-full object-cover object-center"
                                            />
                                        )}
                                    </div>
                                    <div className="absolute w-[15px] h-[15px] min-w-[15px] min-h-[15px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] flex items-center justify-center bg-black">
                                        <Image
                                            src={getChainImage(tokenData.chain_id)}
                                            alt={`${tokenData.name} logo`}
                                            width={100}
                                            height={100}
                                            className="rounded-full w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col mt-[0px]">
                                    <span className="text-[12px] font-semibold  break-keep text-nowrapleading-none">{`${tokenData.symbol}`}</span>
                                    <span className="text-[11px] leading-none">
                                        {getReadableNumber(tokenData.market_data.circulating_market_cap.usd, undefined, '$')}
                                    </span>
                                </div>

                                <div className="flex items-end ml-auto flex-col justify-end  gap-1">
                                    <span className="text-[11px] leading-none">
                                        {getReadableNumber(
                                            tokenData.market_data.current_price.usd,
                                            countDecimalPlaces(tokenData.market_data.current_price.usd ?? 0),
                                            '$'
                                        )}
                                    </span>
                                    <span
                                        className={`text-2xs rounded px-1 py-[2px] leading-none  ${
                                            tokenData.market_data?.price_change['24h']?.percentage > 0
                                                ? 'text-positive bg-positive/10'
                                                : tokenData.market_data?.price_change['24h']?.percentage < 0
                                                ? 'text-negative bg-negative/10'
                                                : 'text-neutral-text'
                                        }`}
                                    >
                                        {getReadableNumber(tokenData.market_data?.price_change['24h']?.percentage, 1)}%
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )
                },
            }),
            columnHelper.accessor('created_at', {
                id: 'created',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>Created</div>,
                cell: info => <div className="p-3 text-center">{getTimeComparison(info.getValue())}</div>,
                sortingFn: 'datetime',
            }),
            columnHelper.accessor('market_data.current_price.usd', {
                id: 'price',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>Price</div>,
                cell: info => {
                    return (
                        <div className="p-3 text-center">
                            {getReadableNumber(info.getValue(), countDecimalPlaces(info.getValue() ?? 0, 2, 2), '$')}
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.circulating_market_cap.usd', {
                id: 'mcap',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>MCAP</div>,
                cell: info => {
                    return <div className="p-3 text-center">{getReadableNumber(info.getValue(), undefined, '$')}</div>
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.liquidity', {
                id: 'liq',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>LIQ</div>,
                cell: info => {
                    return <div className="p-3 text-center">{getReadableNumber(info.getValue(), undefined, '$')}</div>
                },
                sortingFn: 'basic',
            }),

            columnHelper.accessor('holder_count', {
                id: 'holders',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>Holders</div>,
                cell: info => (
                    <div className="p-3 text-center">
                        {info.getValue()}
                        {/* {getReadableNumber(info.getValue(), 0)} */}
                    </div>
                ),
                sortingFn: 'basic',
            }),
            columnHelper.accessor(row => row, {
                id: 'txs',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-nowrap ${border ? 'border-b' : ''} border-border`}>
                        TXS (24H)
                    </div>
                ),
                cell: info => {
                    const tokenData = info.getValue()
                    return (
                        <div className="flex flex-col items-center justify-center px-2">
                            <div className=" leading-5">
                                {getReadableNumber(
                                    tokenData.market_data.total_transactions['24h'].buy + tokenData.market_data.total_transactions['24h'].sell
                                )}
                            </div>
                            {/* <div className="flex gap-1 text-[.7rem] leading-3">
                <div className="text-positive">
                  {tokenData.market_data.total_transactions['24h'].buy}
                </div>
                <div className="text-neutral-text">|</div>
                <div className="text-negative">
                  {tokenData.market_data.total_transactions['24h'].sell}
                </div>
              </div> */}
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor(row => row, {
                id: 'volume24h',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-nowrap ${border ? 'border-b' : ''} border-border`}>
                        VOL (24h)
                    </div>
                ),
                cell: info => {
                    const tokenData = info.getValue()

                    return <div className="p-3 text-center">{getReadableNumber(tokenData.market_data.volume['24h'], 2)}</div>
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.price_change.5m.percentage', {
                id: 'priceChange5m',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>5M</div>,
                cell: info => {
                    return (
                        <div className="p-3 text-center">
                            <PercentageChange size={percentageSize} style={percentageStyle} percentage={info.getValue()} />
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.price_change.1h.percentage', {
                id: 'priceChange1h',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>1h</div>,
                cell: info => {
                    return (
                        <div className="p-3 text-center">
                            <PercentageChange size={percentageSize} style={percentageStyle} percentage={info.getValue()} />
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.price_change.6h.percentage', {
                id: 'priceChange6h',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>6h</div>,
                cell: info => {
                    return (
                        <div className="p-3 text-center">
                            <PercentageChange size={percentageSize} style={percentageStyle} percentage={info.getValue()} />
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor('market_data.price_change.24h.percentage', {
                id: 'priceChange24h',
                header: () => <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>24h</div>,
                cell: info => {
                    return (
                        <div className="p-3 text-center">
                            <PercentageChange size={percentageSize} style={percentageStyle} percentage={info.getValue()} />
                        </div>
                    )
                },
                sortingFn: 'basic',
            }),
            columnHelper.accessor(row => row, {
                id: 'mcapPriceChange24h',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 ${border ? 'border-b' : ''} border-border`}>MCAP/24CHG</div>
                ),
                cell: info => {
                    const tokenData = info.getValue()

                    return (
                        <div
                            className={`p-3 text-center flex flex-col items-center justify-center gap-1
                             ${size === 'extra-small' ? 'text-xs' : ''}
              ${size === 'small' ? 'text-sm' : ''} 
              ${size === 'normal' ? 'text-base' : ''} `}
                        >
                            <div className=" text-center">{getReadableNumber(tokenData.market_data.circulating_market_cap.usd, undefined, '$')}</div>
                            <div>
                                <PercentageChange
                                    size={percentageSize}
                                    style={percentageStyle}
                                    width=" w-fit"
                                    padding="px-2 py-1"
                                    percentage={tokenData.market_data?.price_change['24h']?.percentage}
                                />
                            </div>
                        </div>
                    )
                },
            }),
            columnHelper.accessor(row => row, {
                id: 'quickBuy',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-nowrap ${border ? 'border-b' : ''} border-border`}>
                        Quick Buy
                    </div>
                ),
                cell: info => {
                    const tokenData = info.getValue()

                    return (
                        <div className="flex items-center justify-center">
                            <button
                                type="button"
                                onClick={e => {
                                    e.stopPropagation()
                                    handleSubmitQuickBuy(tokenData)
                                }}
                                className="p-2 min-w-6 min-h-6 text-center pointer-events-auto flex hover:bg-yellow-500/20 apply-transition text-yellow-500 bg-yellow-500/10 rounded-lg border border-border items-center justify-center"
                            >
                                <GiElectric />
                            </button>
                        </div>
                    )
                },
            }),
        ],

        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isTradeSettingsDataFetched]
    )

    const columnVisibility = useMemo(() => {
        return datatableColumns.reduce((acc, column) => {
            acc[column.id!] = columns.includes(column.id!)
            return acc
        }, {} as { [key: string]: boolean })
    }, [datatableColumns, columns])

    const table = useReactTable({
        data: data ?? [],
        columns: datatableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting as OnChangeFn<SortingState>,
        enableSorting: true,
        state: {
            columnVisibility: columnVisibility,
            sorting: sorting,
        },
    })

    const handleRowClick = (row: Row<Token>) => {
        setLastSelectedToken({
            address: row.original.address,
            chain: row.original.chain_id,
        })
        router.push(getTokenUrl(row.original.chain_id, row.original.address, isMobile))
        // router.push(`${path}/${row.original.address}`);
        // Perform any specific action, like navigation
    }

    const handleSubmitQuickBuy = (tokenData: Token) => {
        if (ready && !authenticated) return handleSignIn()
        if (!user) return

        const quickBuyAmount = localStorage.getItem('quickBuyAmount')

        handleExecuteTrade(
            {
                chain: tokenData.chain_id,
                chainAddress: chain.address,
                action: 'buy',
                tokenAddress: tokenData.address,
                amount: quickBuyAmount ? +quickBuyAmount : 0,
                slippageLimit: tradeSettingsData?.slippage ?? tradeSettings[chain.id].defaultSlippage,
                priorityFee: tradeSettingsData?.priorityFee ?? tradeSettings[chain.api].defaultPriorityFee,
                symbol: tokenData.symbol,
                price: tokenData?.market_data.current_price.usd,
            },
            user.id
        )
    }

    const handleSubmitPumpFunBuy = (tokenData: PumpFunLiveToken) => {
        if (ready && !authenticated) return handleSignIn()
        if (!user) return

        const quickBuyAmount = localStorage.getItem('quickBuyAmount')

        // Calculate approximate price per token from market cap
        // Assuming 1B total supply for PumpFun tokens
        const approximatePrice = tokenData.usd_market_cap ? tokenData.usd_market_cap / 1000000000 : 0.0001

        handleExecuteTrade(
            {
                chain: 'solana', // PumpFun is always on Solana
                chainAddress: chain.address,
                action: 'buy',
                tokenAddress: tokenData.mint, // Use mint instead of address
                amount: quickBuyAmount ? +quickBuyAmount : 0,
                slippageLimit: tradeSettingsData?.slippage ?? tradeSettings[chain.id].defaultSlippage,
                priorityFee: tradeSettingsData?.priorityFee ?? tradeSettings[chain.api].defaultPriorityFee,
                symbol: tokenData.symbol,
                price: approximatePrice,
            },
            user.id
        )
    }

    // useEffect(() => {
    //   if (quickBuyAmount === undefined) return;
    //   localStorage.setItem(
    //     'quickBuyAmount',
    //     quickBuyAmount ? quickBuyAmount.toString() : '',
    //   );
    // }, [quickBuyAmount]);

    return (
        <div className={`w-full flex flex-col gap-2 max-h-full overflow-hidden h-full bg-black relative`}>
            <div
                className={`flex-1 flex flex-col  border-border  h-full bg-black overflow-y-hidden ${rounded ? 'rounded-lg' : ''} ${
                    border ? 'border' : ''
                }`}
            >
                <div
                    className={`flex  px-3  flex-wrap items-center  justify-between md:items-center min-h-[3.5rem] max-h-[3.5rem]  border-b border-border ${
                        pathname === '/memecoins' ? 'md:min-h-16 md:max-h-16 ' : 'md:min-h-12 md:max-h-12'
                    }`}
                >
                    <div className="flex flex-row gap-3 items-center flex-wrap">
                        {showHeader && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveMode('trending')}
                                    className={`text-sm font-semibold leading-6 px-3 py-1 rounded-md apply-transition ${
                                        activeMode === 'trending'
                                            ? 'text-white bg-neutral-900'
                                            : 'text-neutral-text-dark hover:text-neutral-text hover:bg-neutral-800'
                                    }`}
                                >
                                    Trending
                                </button>
                                {/* Only show PumpFun Live for Solana */}
                                {chain.id === 'solana' && showPumpFunBadge && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveMode('pumpfun-live')}
                                        className={`text-sm font-semibold leading-6 px-3 py-1 rounded-md apply-transition ${
                                            activeMode === 'pumpfun-live'
                                                ? 'text-white bg-neutral-900'
                                                : 'text-neutral-text-dark hover:text-neutral-text hover:bg-neutral-800'
                                        }`}
                                    >
                                        PumpFun Live
                                    </button>
                                )}
                            </div>
                        )}

                        {activeMode === 'trending' && (
                            <div className="flex items-center">
                                {intervals.map(interval => {
                                    return (
                                        <button
                                            key={interval}
                                            type="button"
                                            onClick={() => {
                                                setActiveInterval(interval)
                                                setSorting([])
                                            }}
                                            className={`flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all h-8 w-10 rounded-md font-semibold  ${
                                                activeInterval === interval ? 'text-neutral-text bg-neutral-900' : 'text-neutral-text-dark'
                                            }`}
                                        >
                                            {interval}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center  ml-auto gap-3 md:flex-none">
                        {(activeMode === 'trending' || activeMode === 'pumpfun-live') && showQuickBuy && <QuickyBuyInput />}

                        {(activeMode === 'trending' || activeMode === 'pumpfun-live') && (
                            <div className="relative block  ">
                                <button
                                    type="button"
                                    className={`flex  bg-table-odd border border-border rounded-lg px-2 gap-2 w-8 min-w-8 h-8  min-h-8 items-center justify-center hover:bg-neutral-800  apply-transition hover:text-neutral-text text-neutral-text`}
                                    onClick={() => setShowChainOptions(!showChainOptions)}
                                >
                                    <div className="min-w-4 min-h-4 max-w-4 max-h-4 relative flex items-center justify-center ">
                                        <Image
                                            src={getChainImage(chain.id)}
                                            alt={`${chain.name} logo`}
                                            width={200}
                                            height={200}
                                            className="rounded-full"
                                        />
                                    </div>
                                </button>

                                {showChainOptions && (
                                    <div className="absolute top-11 z-50  flex flex-col border border-border bg-table-odd rounded-lg p-1  right-0">
                                        {chains.map(chain => {
                                            return (
                                                <button
                                                    key={chain.id}
                                                    type="button"
                                                    className={`flex rounded-lg px-2 gap-2 h-9 min-h-9 items-center hover:bg-neutral-800  apply-transition hover:text-neutral-text text-neutral-text
              }`}
                                                    onClick={() => {
                                                        setChain(chain)
                                                        setShowChainOptions(false)
                                                    }}
                                                >
                                                    <div className="min-w-4 min-h-4 max-w-4 max-h-4 relative flex items-center justify-center ">
                                                        <Image
                                                            src={getChainImage(chain.id)}
                                                            alt={`${chain.name} logo`}
                                                            width={200}
                                                            height={200}
                                                            className="rounded-full"
                                                        />
                                                    </div>
                                                    <span>{chain.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div
                    ref={tableContainerRef}
                    className={`w-full overflow-y-auto mobile-no-scrollbar relative h-full ${enableOverflowX ? '' : 'overflow-x-hidden'}`}
                >
                    {activeMode === 'trending' ? (
                        <table className="w-full">
                            {showTableHeader && (
                                <thead className="sticky top-0 z-10 bg-black">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    className=" cursor-pointer"
                                                    key={header.id}
                                                    onClick={() => {
                                                        header.column.getIsSorted()
                                                            ? header.column.toggleSorting()
                                                            : header.column.toggleSorting(true)
                                                    }}
                                                >
                                                    {showTableHeaderBorder && <div className="absolute w-full bg-border h-[1px] bottom-0"></div>}

                                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                            )}
                            {data && data.length > 0 ? (
                                <tbody>
                                    {table.getRowModel().rows.map(row => (
                                        <tr
                                            key={row.id}
                                            onClick={e => {
                                                e.stopPropagation()
                                                handleRowClick(row)
                                            }}
                                            className=" hover:bg-table-odd hover:cursor-pointer apply-transition"
                                        >
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <TableRowLoading totalRow={30} totalTableData={columns.length} className="p-3 items-center" />
                            )}
                        </table>
                    ) : (
                        <PumpFunLiveGrid
                            onTokenClick={(token: PumpFunLiveToken) => {
                                // Navigate to token detail page
                                setLastSelectedToken({
                                    address: token.mint, // Use mint as address for PumpFun tokens
                                    chain: 'solana', // PumpFun is always on Solana
                                })
                                router.push(getTokenUrl('solana', token.mint, isMobile))
                            }}
                            onBuyClick={handleSubmitPumpFunBuy}
                        />
                    )}
                </div>
            </div>
            {isError && (
                <div
                    className={`absolute bottom-4 right-4 border-red-500 border bg-red-500/20  backdrop-blur text-red-500 p-2 text-sm ${
                        rounded ? 'rounded-lg' : ''
                    }`}
                >
                    {error && error.message ? error.message : 'Something went wrong.'}
                </div>
            )}
        </div>
    )
}

export default TrendingPanel
