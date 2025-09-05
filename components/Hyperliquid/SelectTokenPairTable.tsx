import Image from 'next/image'
import React, { useEffect, useState, useRef, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'

import { usePairTokensContext } from '@/context/pairTokensContext'
import { SpotAsset } from '@/types/hyperliquid'
import { PairData } from '@/types/hyperliquid'
import { formatCryptoPrice, getReadableNumber } from '@/utils/price'
import useIsMobile from '@/hooks/useIsMobile'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import clsx from 'clsx'

interface TokenPairsInfoTableProps {
    handleClose: () => void
    tableIsOpen: boolean
    showPerpsOnly?: boolean
    redirect?: boolean
    className?: string
}

type SortConfig = {
    key: string
    direction: 'asc' | 'desc'
} | null

const tabs = ['All', 'Perps', 'Spot']

const TokenPairsInfoTable = ({
    tableIsOpen,
    handleClose,
    redirect = true,
    className = 'absolute top-16 left-0 right-0 z-[100] w-full max-h-[400px] overflow-hidden flex flex-col',
}: TokenPairsInfoTableProps) => {
    const menuRef = useRef<HTMLDivElement>(null)

    //------Hooks------`
    const { tokenPairData, spotTokensData, setIsSpotToken, setTokenId, setSpotTokenId } = usePairTokensContext()
    const router = useRouter()
    const isMobile = useIsMobile()

    //------Local State------
    const [activeTab, setActiveTab] = useState('All') // Default active tab
    const [searchQuery, setSearchQuery] = useState('')
    const [sortConfig, setSortConfig] = useState<SortConfig>(null) // No default sorting
    const [hoveredHeader, setHoveredHeader] = useState<string | null>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click target is the toggle button
            const toggleButton = document.querySelector('[data-token-pairs-toggle]')

            if (toggleButton?.contains(event.target as Node)) {
                return
            }

            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleClose()
            }
        }

        if (tableIsOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [tableIsOpen, handleClose])

    const handleClickTab = (tabName: string) => {
        setActiveTab(tabName)
    }

    // Handle sorting when a column header is clicked
    const handleSort = (key: string) => {
        setSortConfig(prevSortConfig => {
            if (prevSortConfig?.key === key) {
                // Toggle direction if same column
                return {
                    key: key,
                    direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc',
                }
            } else {
                // Default to ascending for new column
                return { key: key, direction: 'asc' }
            }
        })
    }

    // Function to get sort icon
    const getSortIcon = (columnId: string) => {
        // Always show icon for the currently sorted column
        if (sortConfig?.key === columnId) {
            return sortConfig.direction === 'asc' ? (
                <FaSortUp className="inline-block ml-1 text-white" />
            ) : (
                <FaSortDown className="inline-block ml-1 text-white" />
            )
        }

        // Only show sort icon on hover for non-sorted columns
        return hoveredHeader === columnId ? <FaSort className="inline-block ml-1 opacity-70" /> : null
    }

    // Get header style with appropriate visibility classes
    const getHeaderStyle = (columnId: string, isMobileHidden = false) => {
        const isCurrentSort = sortConfig?.key === columnId
        const visibilityClass = isMobileHidden ? 'hidden md:table-cell' : ''
        return `p-2 cursor-pointer transition-colors ${visibilityClass} ${
            isCurrentSort ? 'text-primary hover:text-primary-light' : 'hover:text-neutral-text text-neutral-text-dark'
        }`
    }

    // Filter and sort the data based on the active tab, search query, and sort config
    const filteredData = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let dataToProcess: any[] = []

        // Determine which dataset to use based on the tab
        if (activeTab === 'All') {
            dataToProcess = [...(tokenPairData || []), ...(spotTokensData || [])]
        } else if (activeTab === 'Perps') {
            dataToProcess = tokenPairData || []
        } else if (activeTab === 'Spot') {
            dataToProcess = spotTokensData || []
        }

        // Filter out perps tokens with zero volume
        dataToProcess = dataToProcess.filter(data => {
            // For perps tokens (those with 'universe' property), filter out zero volume
            if ('universe' in data) {
                return data.assetCtx && Number(data.assetCtx.dayBaseVlm) !== 0
            }
            // Keep all spot tokens
            return true
        })

        // Then filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase()
            dataToProcess = dataToProcess
                .filter(data => {
                    // Handle both perps and spot data structures
                    if ('universe' in data) {
                        // This is a perp token
                        const name = data.universe.name.toLowerCase()
                        return name.includes(query)
                    } else {
                        // This is a spot token
                        const name = data.name.toLowerCase()
                        return name.includes(query)
                    }
                })
                .sort((a, b) => {
                    const nameA = ('universe' in a ? a.universe.name : a.name).toLowerCase()
                    const nameB = ('universe' in b ? b.universe.name : b.name).toLowerCase()

                    const startsWithA = nameA.startsWith(query)
                    const startsWithB = nameB.startsWith(query)

                    if (startsWithA && !startsWithB) return -1
                    if (!startsWithA && startsWithB) return 1
                    return nameA.localeCompare(nameB)
                })
        }

        // Then sort the data
        if (sortConfig) {
            dataToProcess.sort((a, b) => {
                let aValue, bValue
                const isPerpA = 'universe' in a
                const isPerpB = 'universe' in b

                // Extract values based on the sort key
                switch (sortConfig.key) {
                    case 'symbol':
                        aValue = isPerpA ? a.universe.name : a.name
                        bValue = isPerpB ? b.universe.name : b.name
                        break
                    case 'lastPrice':
                        aValue = parseFloat(isPerpA ? a.assetCtx.markPx : a.markPx)
                        bValue = parseFloat(isPerpB ? b.assetCtx.markPx : b.markPx)
                        break
                    case 'change':
                        // Calculate percentage change
                        if (isPerpA) {
                            const currentA = parseFloat(a.assetCtx.markPx)
                            const prevA = parseFloat(a.assetCtx.prevDayPx)
                            aValue = prevA !== 0 ? ((currentA - prevA) / prevA) * 100 : 0
                        } else {
                            const currentA = parseFloat(a.markPx)
                            const prevA = parseFloat(a.prevDayPx)
                            aValue = prevA !== 0 ? ((currentA - prevA) / prevA) * 100 : 0
                        }

                        if (isPerpB) {
                            const currentB = parseFloat(b.assetCtx.markPx)
                            const prevB = parseFloat(b.assetCtx.prevDayPx)
                            bValue = prevB !== 0 ? ((currentB - prevB) / prevB) * 100 : 0
                        } else {
                            const currentB = parseFloat(b.markPx)
                            const prevB = parseFloat(b.prevDayPx)
                            bValue = prevB !== 0 ? ((currentB - prevB) / prevB) * 100 : 0
                        }
                        break
                    case 'fundingOrMid':
                        aValue = isPerpA ? parseFloat(a.assetCtx.funding || 0) : parseFloat(a.midPx)
                        bValue = isPerpB ? parseFloat(b.assetCtx.funding || 0) : parseFloat(b.midPx)
                        break
                    case 'volume':
                        aValue = isPerpA ? parseFloat(a.assetCtx.dayNtlVlm || 0) : parseFloat(a.dayNtlVlm || 0)
                        bValue = isPerpB ? parseFloat(b.assetCtx.dayNtlVlm || 0) : parseFloat(b.dayNtlVlm || 0)
                        break
                    case 'openInterestOrSupply':
                        aValue = isPerpA
                            ? parseFloat(a.assetCtx.openInterest || 0) * parseFloat(a.assetCtx.markPx || 0)
                            : parseFloat(a.circulatingSupply || 0)
                        bValue = isPerpB
                            ? parseFloat(b.assetCtx.openInterest || 0) * parseFloat(b.assetCtx.markPx || 0)
                            : parseFloat(b.circulatingSupply || 0)
                        break
                    case 'leverage':
                        aValue = isPerpA ? parseFloat(a.universe.maxLeverage || 0) : 1
                        bValue = isPerpB ? parseFloat(b.universe.maxLeverage || 0) : 1
                        break
                    default:
                        aValue = 0
                        bValue = 0
                }

                // String comparison for text values
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase()
                    bValue = bValue.toLowerCase()
                }

                // Apply sort direction
                const direction = sortConfig.direction === 'asc' ? 1 : -1

                if (aValue < bValue) return -1 * direction
                if (aValue > bValue) return 1 * direction
                return 0
            })
        }

        return dataToProcess
    }, [activeTab, searchQuery, tokenPairData, spotTokensData, sortConfig])

    const handleSelectPairs = (data: PairData | SpotAsset) => {
        // Store to session storage
        const isPerpData = 'universe' in data

        localStorage.setItem('tokenId', (isPerpData ? data.universe.name : data.tokenId) || '')
        localStorage.setItem('assetId', (isPerpData ? data?.assetId?.toString() : data?.coin?.toString()) || '')

        // Determine route based on token type
        if (!redirect) {
            if (isPerpData) {
                setTokenId(data.universe.name as string)
                setIsSpotToken(false)
            } else {
                setTokenId(data.name as string)
                setSpotTokenId(data.coin?.toString() || null)
                setIsSpotToken(true)
            }
            handleClose()
            return
        }

        let route
        if (isPerpData) {
            const perpData = data as PairData
            route = `${isMobile ? '/mobile/perps/' : '/perps/'}${perpData.universe.name}?assetId=${perpData.assetId}`
        } else {
            const spotData = data as SpotAsset
            route = `${isMobile ? '/mobile/perps/' : '/perps/'}${spotData.tokenId}?coin=${spotData.coin}`
        }

        // Navigate to the route
        router.push(route)
        handleClose()
    }

    if (!tableIsOpen) {
        return null
    }

    return (
        <div
            onClick={e => {
                e.stopPropagation()
            }}
            className={`${className}`}
            ref={menuRef}
        >
            <div className="bg-black border-b border-border  max-h-full flex-1 overflow-hidden w-full shadow-lg flex flex-col ">
                {/* Search Input */}
                <div className="p-3 flex flex-col gap-2">
                    <input
                        className="text-sm font-semibold bg-table-odd focus:outline-none px-2 h-9 w-full border border-border focus:bg-neutral-900 text-neutral-text rounded"
                        placeholder="Search coins..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    {/* Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto min-h-fit">
                        {tabs.map(tabName => (
                            <button
                                key={tabName}
                                className={`flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 apply-transition px-2 rounded-md font-semibold ${
                                    activeTab === tabName ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                }`}
                                onClick={() => handleClickTab(tabName)}
                            >
                                {tabName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="flex flex-col overflow-y-auto flex-1 max-h-full border-t border-border">
                    <table className="w-full flex-1">
                        <thead className="sticky top-0 bg-black z-10 border-b border-border">
                            <tr>
                                <th
                                    className={getHeaderStyle('symbol')}
                                    onClick={() => handleSort('symbol')}
                                    onMouseEnter={() => setHoveredHeader('symbol')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        Symbol
                                        <span className="w-4 flex justify-center">{getSortIcon('symbol')}</span>
                                    </div>
                                </th>
                                <th
                                    className={getHeaderStyle('lastPrice')}
                                    onClick={() => handleSort('lastPrice')}
                                    onMouseEnter={() => setHoveredHeader('lastPrice')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        Last Price
                                        <span className="w-4 flex justify-center">{getSortIcon('lastPrice')}</span>
                                    </div>
                                </th>
                                <th
                                    className={getHeaderStyle('change', true)}
                                    onClick={() => handleSort('change')}
                                    onMouseEnter={() => setHoveredHeader('change')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        24hr Change
                                        <span className="w-4 flex justify-center">{getSortIcon('change')}</span>
                                    </div>
                                </th>
                                <th
                                    className={getHeaderStyle('fundingOrMid', true)}
                                    onClick={() => handleSort('fundingOrMid')}
                                    onMouseEnter={() => setHoveredHeader('fundingOrMid')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        {activeTab === 'Spot' ? 'Mid Price' : '8hr Funding'}
                                        <span className="w-4 flex justify-center">{getSortIcon('fundingOrMid')}</span>
                                    </div>
                                </th>
                                <th
                                    className={getHeaderStyle('volume', true)}
                                    onClick={() => handleSort('volume')}
                                    onMouseEnter={() => setHoveredHeader('volume')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        Volume
                                        <span className="w-4 flex justify-center">{getSortIcon('volume')}</span>
                                    </div>
                                </th>
                                <th
                                    className={getHeaderStyle('openInterestOrSupply', true)}
                                    onClick={() => handleSort('openInterestOrSupply')}
                                    onMouseEnter={() => setHoveredHeader('openInterestOrSupply')}
                                    onMouseLeave={() => setHoveredHeader(null)}
                                >
                                    <div className="text-neutral-text-dark uppercase text-[10px] text-left flex items-center">
                                        {activeTab === 'Spot' ? 'Supply' : 'Open Interest'}
                                        <span className="w-4 flex justify-center">{getSortIcon('openInterestOrSupply')}</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData?.map((data, index) => {
                                const isPerpData = 'universe' in data

                                // Calculate percentage change for both perp and spot tokens
                                let percentChange = 0

                                if (isPerpData) {
                                    // Calculate perp token change exactly like in HyperliquidTokensPanel
                                    const current = parseFloat((data as PairData).assetCtx.markPx)
                                    const prev = parseFloat((data as PairData).assetCtx.prevDayPx)
                                    if (prev && prev !== 0) {
                                        percentChange = ((current - prev) / prev) * 100
                                    }
                                } else {
                                    // Calculate spot token change
                                    const current = parseFloat((data as SpotAsset).markPx)
                                    const prev = parseFloat((data as SpotAsset).prevDayPx)
                                    if (prev && prev !== 0) {
                                        percentChange = ((current - prev) / prev) * 100
                                    }
                                }

                                return (
                                    <tr
                                        key={index}
                                        onClick={() => handleSelectPairs(data)}
                                        className="hover:bg-table-odd cursor-pointer border-b border-border apply-transition"
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className="flex items-center gap-2 text-neutral-text text-xs">
                                                    <TokenImage
                                                        imageUrl={`/api/hyperliquid/coin-image?coin=${
                                                            isPerpData ? data.universe.name : data.name + '_USDC'
                                                        }`}
                                                        symbol={isPerpData ? data.universe.name : data.name}
                                                    />
                                                    {isPerpData ? data.universe.name : data.name}
                                                </span>
                                                <span className="px-1.5 py-0.5 text-[10px] bg-blue-600/20 text-blue-500 rounded">
                                                    {isPerpData ? `${data.universe.maxLeverage}X` : 'SPOT'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-neutral-text text-xs">
                                            ${formatCryptoPrice(parseFloat(isPerpData ? data.assetCtx.markPx : data.markPx))}
                                        </td>
                                        <td className={`p-2 text-xs hidden md:table-cell ${percentChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                                            {isFinite(percentChange) ? `${percentChange.toFixed(2)}%` : '- -'}
                                        </td>
                                        <td className="p-3 text-neutral-text text-xs hidden md:table-cell">
                                            {isPerpData
                                                ? (parseFloat(data.assetCtx.funding || 0) * 100).toFixed(4) + '%'
                                                : activeTab === 'All'
                                                ? '- -'
                                                : '$' + formatCryptoPrice(parseFloat(data.midPx))}
                                        </td>
                                        <td className="p-3 text-neutral-text text-xs hidden md:table-cell">
                                            $
                                            {getReadableNumber(
                                                parseFloat(isPerpData ? (data.assetCtx.dayNtlVlm ? data.assetCtx.dayNtlVlm : '0') : data.dayNtlVlm),
                                                2
                                            )}
                                        </td>
                                        <td className="p-3 text-neutral-text text-xs hidden md:table-cell">
                                            {isPerpData
                                                ? getReadableNumber(
                                                      parseFloat(data.assetCtx.openInterest || 0) * parseFloat(data.assetCtx.markPx || 0),
                                                      2
                                                  )
                                                : getReadableNumber(parseFloat(data.circulatingSupply), 2)}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export const TokenImage = memo(
    ({
        imageUrl,
        symbol,
        width = 16,
        height = 16,
        className,
    }: {
        imageUrl: string
        symbol: string
        width?: number
        height?: number
        className?: string
    }) => {
        const [imageError, setImageError] = useState(false)

        return (
            <Image
                priority
                src={imageError ? TOKEN_PLACEHOLDER_IMAGE : imageUrl}
                alt={symbol}
                width={width}
                height={height}
                suppressHydrationWarning
                unoptimized
                style={{
                    backgroundColor: 'white',
                }}
                className={clsx('rounded-full max-w-4 maxh-4 overflow-hidden', className)}
                onError={() => setImageError(true)}
                crossOrigin="anonymous"
            />
        )
    }
)

TokenImage.displayName = 'TokenImage'

export default TokenPairsInfoTable
