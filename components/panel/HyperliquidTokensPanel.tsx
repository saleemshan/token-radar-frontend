'use client'
import React, { useMemo, useState } from 'react'

import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, OnChangeFn, SortingState, useReactTable } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { usePairTokensContext } from '@/context/pairTokensContext'
import { PairData, SpotAsset } from '@/types/hyperliquid'
import { getReadableNumber } from '@/utils/price'
import TableRowLoading from '../TableRowLoading'

const columnHelperPair = createColumnHelper<PairData>()
const columnHelperSpot = createColumnHelper<SpotAsset>()

const HyperliquidTokensPanel = ({
    border = true,
    rounded = true,
    isMobile = false,
}: {
    columns?: string[]
    border?: boolean
    rounded?: boolean
    showSocials?: boolean
    showTokenAddress?: boolean
    percentageStyle?: boolean
    percentageSize?: 'normal' | 'small'
    path?: string
    queryParams?: boolean
    isMobile?: boolean
}) => {
    const router = useRouter()

    const { tokenPairData, spotTokensData } = usePairTokensContext()

    const [sorting, setSorting] = useState([])

    const [activeTab, setActiveTab] = useState<'perps' | 'spot'>('perps')

    // Define spot columns
    const spotColumns = useMemo(
        () => [
            columnHelperSpot.accessor('name', {
                id: 'token',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-left ${border ? 'border-b' : ''} border-border`}>Token</div>
                ),
                cell: info => (
                    <div className="flex items-center justify-start gap-2 p-3">
                        <div className="flex items-center gap-2">
                            <span className="text-neutral-text text-xs">{info.getValue()}</span>
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-600/20 text-green-500 rounded">SPOT</span>
                        </div>
                    </div>
                ),
            }),
            columnHelperSpot.accessor('markPx', {
                id: 'markPrice',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>Price</div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperSpot.accessor('midPx', {
                id: 'midPrice',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        Mid Price
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperSpot.accessor(
                row => {
                    const current = parseFloat(row.markPx)
                    const prev = parseFloat(row.prevDayPx)

                    // Handle cases where prev is 0 or invalid
                    if (!prev || prev === 0) return 0

                    const change = ((current - prev) / prev) * 100
                    // Handle Infinity or NaN cases
                    return isFinite(change) ? change : 0
                },
                {
                    id: 'change24h',
                    header: () => (
                        <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                            24h Change
                        </div>
                    ),
                    cell: info => {
                        const value = info.getValue()
                        return <div className={`p-3 text-xs text-center ${value >= 0 ? 'text-positive' : 'text-negative'}`}>{value.toFixed(2)}%</div>
                    },
                }
            ),
            columnHelperSpot.accessor('dayNtlVlm', {
                id: 'volume',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        VOL(24H)
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperSpot.accessor('circulatingSupply', {
                id: 'circulatingSupply',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        TXS(24H)
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">{getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
        ],
        [border]
    )

    // Rest of your existing perps columns
    const perpsColumns = useMemo(
        () => [
            columnHelperPair.accessor(row => row, {
                id: 'token',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-left ${border ? 'border-b' : ''} border-border`}>Pair</div>
                ),
                cell: info => {
                    const pairData = info.getValue()
                    return (
                        <div className="flex items-center justify-start gap-2 p-3">
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-text text-xs">{pairData.universe.name}</span>
                                <span className="px-1.5 py-0.5 text-[10px] bg-green-600/20 text-green-500 rounded">
                                    {pairData.universe.maxLeverage}X
                                </span>
                            </div>
                        </div>
                    )
                },
            }),
            columnHelperPair.accessor('assetCtx.markPx', {
                id: 'markPrice',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        Mark Price
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperPair.accessor('assetCtx.oraclePx', {
                id: 'oraclePrice',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        Oracle Price
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperPair.accessor(
                row => {
                    const current = parseFloat(row.assetCtx.markPx)
                    const prev = parseFloat(row.assetCtx.prevDayPx)
                    const change = ((current - prev) / prev) * 100
                    return change
                },
                {
                    id: 'change24h',
                    header: () => (
                        <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                            24h Change
                        </div>
                    ),
                    cell: info => {
                        const value = info.getValue()
                        return <div className={`p-3 text-xs text-center ${value >= 0 ? 'text-positive' : 'text-negative'}`}>{value.toFixed(2)}%</div>
                    },
                }
            ),
            columnHelperPair.accessor('assetCtx.funding', {
                id: 'funding',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        Funding Rate
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">{(parseFloat(info.getValue()) * 100).toFixed(4)}%</div>,
            }),
            columnHelperPair.accessor('assetCtx.dayNtlVlm', {
                id: 'volume',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        24h Volume
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">${getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
            columnHelperPair.accessor('assetCtx.openInterest', {
                id: 'openInterest',
                header: () => (
                    <div className={`text-neutral-text-dark uppercase text-xs p-3 text-center ${border ? 'border-b' : ''} border-border`}>
                        Open Interest
                    </div>
                ),
                cell: info => <div className="p-3 text-neutral-text text-xs text-center">{getReadableNumber(parseFloat(info.getValue()), 2)}</div>,
            }),
        ],
        [border]
    )

    const columnVisibility = useMemo(() => {
        const columns = activeTab === 'perps' ? perpsColumns : spotColumns
        return columns.reduce((acc, column) => {
            acc[column.id!] = true
            return acc
        }, {} as { [key: string]: boolean })
    }, [perpsColumns, spotColumns, activeTab])

    // Split into two separate table configurations
    const perpsTable = useReactTable({
        data: tokenPairData ?? [],
        columns: perpsColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting as OnChangeFn<SortingState>,
        enableSorting: true,
        state: {
            columnVisibility,
            sorting,
        },
    })

    const spotTable = useReactTable({
        data: spotTokensData ?? [],
        columns: spotColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting as OnChangeFn<SortingState>,
        enableSorting: true,
        state: {
            columnVisibility,
            sorting,
        },
    })

    const getTradeRoute = (row: SpotAsset | PairData, type: 'perps' | 'spot', isMobile: boolean): string => {
        const basePath = isMobile ? '/mobile/perps/' : '/perps/'
        if (type === 'perps') {
            return `${basePath}${(row as PairData).universe.name}?assetId=${(row as PairData).assetId}`
        }
        const spotAsset = row as SpotAsset
        return `${basePath}${spotAsset.tokenId}?coin=${spotAsset.coin}`
    }

    const handleRowClick = (row: SpotAsset | PairData) => {
        const route = getTradeRoute(row, activeTab, isMobile)
        router.push(route)
    }

    return (
        <div className="w-full flex flex-col gap-2 max-h-full overflow-hidden h-full bg-black relative">
            <div
                className={`flex-1 flex flex-col border-border h-full bg-black overflow-y-hidden overflow-x-auto ${rounded ? 'rounded-lg' : ''} ${
                    border ? 'border' : ''
                }`}
            >
                <div className={`flex p-3 border-border gap-3 flex-wrap items-end justify-between md:items-center ${border ? 'border-b' : ''}`}>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <div className="text-base font-semibold leading-6 text-white bg-black">
                            Hyperliquid {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tokens
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-neutral-900 rounded-lg p-1">
                            {['perps', 'spot'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as 'perps' | 'spot')}
                                    className={`px-4 py-1 rounded-md text-sm font-medium ${
                                        activeTab === tab ? 'bg-neutral-800 text-white' : 'text-neutral-text-dark hover:text-white'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-y-auto mobile-no-scrollbar relative h-full border-t border-border">
                    <table className="w-full">
                        <thead className="sticky top-0 z-10 bg-black">
                            {activeTab === 'perps'
                                ? perpsTable.getHeaderGroups().map(headerGroup => (
                                      <tr key={headerGroup.id}>
                                          {headerGroup.headers.map(header => (
                                              <th
                                                  className="cursor-pointer"
                                                  key={header.id}
                                                  onClick={() => {
                                                      header.column.getIsSorted() ? header.column.toggleSorting() : header.column.toggleSorting(true)
                                                  }}
                                              >
                                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                              </th>
                                          ))}
                                      </tr>
                                  ))
                                : spotTable.getHeaderGroups().map(headerGroup => (
                                      <tr key={headerGroup.id}>
                                          {headerGroup.headers.map(header => (
                                              <th
                                                  className="cursor-pointer"
                                                  key={header.id}
                                                  onClick={() => {
                                                      header.column.getIsSorted() ? header.column.toggleSorting() : header.column.toggleSorting(true)
                                                  }}
                                              >
                                                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                              </th>
                                          ))}
                                      </tr>
                                  ))}
                        </thead>
                        {activeTab === 'perps' ? (
                            tokenPairData && tokenPairData.length > 0 ? (
                                <tbody>
                                    {perpsTable.getRowModel().rows.map(row => (
                                        <tr key={row.id} className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            ) : (
                                <TableRowLoading className="p-3 items-center" totalRow={30} totalTableData={perpsColumns.length} />
                            )
                        ) : spotTokensData && spotTokensData.length > 0 ? (
                            <tbody>
                                {spotTable.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="cursor-pointer" onClick={() => handleRowClick(row.original)}>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <TableRowLoading className="p-3 items-center" totalRow={30} totalTableData={spotColumns.length} />
                        )}
                    </table>
                </div>
            </div>
        </div>
    )
}

export default HyperliquidTokensPanel
