import React, { useMemo, useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../ui/table'
import useUnstakingQueueData from '@/hooks/data/useUnstakingQueueData'
import { transformUnstakingQueueData } from '@/utils/unstaking'
import Input from '../Input'

interface UnstakingQueueTableProps {
    className?: string
    pageSize?: number
    showTotalItems?: boolean
}

// Separate component for time display to isolate re-renders
const TimeCell: React.FC<{ requestTime: number }> = ({ requestTime }) => {
    const [currentTime, setCurrentTime] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const unstakingCompletionTime = requestTime + 7 * 24 * 60 * 60 * 1000
    const timeDiff = unstakingCompletionTime - currentTime

    if (timeDiff <= 0) {
        // Show relative past time
        const pastTime = Math.abs(timeDiff)
        const daysAgo = Math.floor(pastTime / (1000 * 60 * 60 * 24))
        const hoursAgo = Math.floor((pastTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutesAgo = Math.floor((pastTime % (1000 * 60 * 60)) / (1000 * 60))

        let timeDisplay = ''
        if (daysAgo > 0) {
            timeDisplay = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
        } else if (hoursAgo > 0) {
            timeDisplay = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
        } else if (minutesAgo > 0) {
            timeDisplay = `${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`
        } else {
            timeDisplay = 'Just now'
        }

        return <span className="text-neutral-text-dark text-xs">{timeDisplay}</span>
    }

    const daysLeft = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hoursLeft = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    const secondsLeft = Math.floor((timeDiff % (1000 * 60)) / 1000)

    let timeDisplay = ''
    if (daysLeft > 0) {
        timeDisplay = `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`
    } else if (hoursLeft > 0) {
        timeDisplay = `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} left`
    } else if (minutesLeft > 0) {
        timeDisplay = `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} left`
    } else {
        timeDisplay = `${secondsLeft} second${secondsLeft > 1 ? 's' : ''} left`
    }

    return <span className="text-primary text-xs">{timeDisplay}</span>
}

const UnstakingQueueTable: React.FC<UnstakingQueueTableProps> = ({ className = '', pageSize = 50, showTotalItems = true }) => {
    const { data: apiData, isLoading, error } = useUnstakingQueueData()
    const [searchAddress, setSearchAddress] = useState('')

    // Include both pending and completed unstaking data (show all recent data)
    const allRecentData = useMemo(() => {
        if (!apiData?.queue) return []

        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

        // Show both pending and recently completed unstaking requests
        return apiData.queue.filter(item => {
            const unstakingCompletionTime = item.time + 7 * 24 * 60 * 60 * 1000
            // Include if still pending OR completed within the last 7 days
            return unstakingCompletionTime > sevenDaysAgo
        })
    }, [apiData])

    // Transform data with search filter and separate past/future
    const transformedData = useMemo(() => {
        if (!allRecentData.length) return []

        const now = Date.now()
        const transformed = transformUnstakingQueueData(allRecentData)

        // Add completion status to each item
        const dataWithStatus = transformed.map(item => {
            const originalData = allRecentData.find(orig => orig.user_address === item.id)
            const unstakingCompletionTime = originalData ? originalData.time + 7 * 24 * 60 * 60 * 1000 : 0
            const isCompleted = unstakingCompletionTime <= now

            return {
                ...item,
                isCompleted,
                completionTime: unstakingCompletionTime,
                timeDiff: unstakingCompletionTime - now,
            }
        })

        // Filter by search if needed
        const filtered = searchAddress.trim()
            ? dataWithStatus.filter(item => item.id.toLowerCase().includes(searchAddress.toLowerCase()))
            : dataWithStatus

        // Sort: completed items first (most recent first), then pending items (soonest first)
        return filtered.sort((a, b) => {
            // If both completed or both pending, sort by time
            if (a.isCompleted === b.isCompleted) {
                if (a.isCompleted) {
                    // For completed: most recently completed first (higher completion time = more recent)
                    return b.completionTime - a.completionTime
                } else {
                    // For pending: soonest to complete first (lower time diff = sooner)
                    return a.timeDiff - b.timeDiff
                }
            }
            // Completed items come first
            return a.isCompleted ? -1 : 1
        })
    }, [allRecentData, searchAddress])

    // Create a map for faster lookups
    const queueMap = useMemo(() => {
        const map = new Map()
        allRecentData.forEach(item => {
            map.set(item.user_address, item)
        })
        return map
    }, [allRecentData])

    // Stable column definitions with design system styling
    const columns = useMemo<ColumnDef<TransformedUnstakingItem>[]>(
        () => [
            {
                accessorKey: 'minutesLeft',
                header: 'Time',
                maxSize: 200,
                cell: ({ row }) => {
                    const originalData = queueMap.get(row.original.id)
                    if (!originalData) return <span className="text-neutral-text-dark text-xs">-</span>
                    return <TimeCell requestTime={originalData.time} />
                },
                sortingFn: (rowA, rowB) => {
                    const originalDataA = queueMap.get(rowA.original.id)
                    const originalDataB = queueMap.get(rowB.original.id)

                    if (!originalDataA || !originalDataB) return 0

                    const now = Date.now()
                    const completionTimeA = originalDataA.time + 7 * 24 * 60 * 60 * 1000
                    const completionTimeB = originalDataB.time + 7 * 24 * 60 * 60 * 1000
                    const isCompletedA = completionTimeA <= now
                    const isCompletedB = completionTimeB <= now

                    // Sort completed first, then by time
                    if (isCompletedA !== isCompletedB) {
                        return isCompletedA ? -1 : 1
                    }

                    if (isCompletedA) {
                        // For completed: most recent first
                        return completionTimeB - completionTimeA
                    } else {
                        // For pending: soonest first
                        return completionTimeA - now - (completionTimeB - now)
                    }
                },
            },
            {
                accessorKey: 'id',
                header: 'Address',
                cell: ({ getValue }) => {
                    const address = getValue() as string
                    const originalData = queueMap.get(address)
                    const now = Date.now()
                    const isCompleted = originalData ? originalData.time + 7 * 24 * 60 * 60 * 1000 <= now : false

                    return <span className={`font-mono text-xs ${isCompleted ? 'text-neutral-text-dark' : 'text-neutral-text'}`}>{address}</span>
                },
                sortingFn: 'alphanumeric',
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: ({ getValue, row }) => {
                    const amount = getValue() as number
                    const originalData = queueMap.get(row.original.id)
                    const now = Date.now()
                    const isCompleted = originalData ? originalData.time + 7 * 24 * 60 * 60 * 1000 <= now : false

                    return (
                        <div className="text-right">
                            <span className={`text-xs ${isCompleted ? 'text-neutral-text-dark' : 'text-neutral-text'}`}>
                                {amount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}{' '}
                                HYPE
                            </span>
                        </div>
                    )
                },
                sortingFn: 'basic',
                size: 120,
            },
        ],
        [queueMap]
    )

    return (
        <div className="space-y-4">
            {showTotalItems && allRecentData.length > 0 && (
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-neutral-text-dark uppercase">Recent Unstakings</h2>
                    <div className="text-xs text-neutral-text-dark">{allRecentData.length.toLocaleString()} total requests</div>
                </div>
            )}

            {/* Search Filter */}
            <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                    <Input type="text" placeholder="Filter by address..." value={searchAddress} onChange={e => setSearchAddress(e.target.value)} />
                </div>
                {searchAddress && (
                    <div className="text-xs text-neutral-text-dark">
                        {transformedData.length} result{transformedData.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            <DataTable
                data={transformedData}
                columns={columns}
                loading={isLoading}
                error={error || undefined}
                pageSize={pageSize}
                emptyMessage={searchAddress ? 'No addresses match your search' : 'No pending unstaking requests found'}
                initialSorting={[{ id: 'minutesLeft', desc: false }]}
                className={className}
            />
        </div>
    )
}

export default UnstakingQueueTable
