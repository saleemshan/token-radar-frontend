export const transformUnstakingQueueData = (queue: UnstakingQueueItem[]): TransformedUnstakingItem[] => {
    return queue.map(item => {
        // Calculate minutes until completion (assuming 7 days unstaking period)
        const now = Date.now()
        const unstakingTime = item.time + 7 * 24 * 60 * 60 * 1000 // 7 days from original time
        const minutesLeft = Math.max(0, Math.floor((unstakingTime - now) / (1000 * 60)))

        return {
            id: item.user_address,
            timestamp: minutesLeft.toString(),
            amount: item.wei / 1e8, // Convert wei to HYPE (8 decimals)
            status: minutesLeft > 0 ? 'pending' : 'completed',
            minutesLeft,
        }
    })
}

export const generateChartData = (queue: UnstakingQueueItem[], totalWei: number, currentTime?: number): UnstakingChartDataPoint[] => {
    if (!queue.length) {
        return [{ date: new Date().toISOString().split('T')[0], balance: 0 }]
    }

    const now = currentTime || Date.now()

    // Filter for only upcoming unstakings (pending ones)
    const upcomingUnstakings = queue.filter(item => {
        const unstakingCompletionTime = item.time + 7 * 24 * 60 * 60 * 1000 // 7 days
        return unstakingCompletionTime > now
    })

    if (!upcomingUnstakings.length) {
        return [{ date: new Date().toISOString().split('T')[0], balance: 0 }]
    }

    // Group upcoming unstakings by completion date
    const groupedByCompletionDate = upcomingUnstakings.reduce((acc, item) => {
        const completionTime = item.time + 7 * 24 * 60 * 60 * 1000
        const completionDate = new Date(completionTime).toISOString().split('T')[0]
        if (!acc[completionDate]) {
            acc[completionDate] = 0
        }
        acc[completionDate] += item.wei / 1e8 // Convert wei to HYPE (8 decimals)
        return acc
    }, {} as Record<string, number>)

    // Create time series data showing actual amount unlocking on each day
    const sortedDates = Object.keys(groupedByCompletionDate).sort()

    const timeSeriesData = sortedDates.map(date => ({
        date,
        balance: groupedByCompletionDate[date], // Show actual amount unlocking on this day
    }))

    return timeSeriesData
}

export const generatePastChartData = (
    queue: UnstakingQueueItem[],
    currentTime: number,
    daysBack: number = 30
): { pastUnlocks: Array<{ date: string; amount: number }> } => {
    const now = currentTime
    const daysBackMs = now - daysBack * 24 * 60 * 60 * 1000

    // Get completed unstakings from the queue (completion time <= current time)
    const completedUnstakings = queue.filter(item => {
        const unstakingCompletionTime = item.time + 7 * 24 * 60 * 60 * 1000
        // Only include completed unstakings within the specified days back
        return unstakingCompletionTime <= now && unstakingCompletionTime >= daysBackMs
    })

    // Group completed unstakings by completion date
    const completedByDate = completedUnstakings.reduce((acc, item) => {
        const completionTime = item.time + 7 * 24 * 60 * 60 * 1000
        const completionDate = new Date(completionTime).toISOString().split('T')[0]

        if (!acc[completionDate]) {
            acc[completionDate] = 0
        }
        acc[completionDate] += item.wei / 1e8 // Convert wei to HYPE (8 decimals)
        return acc
    }, {} as Record<string, number>)

    // Create time series for past unlocks
    const pastUnlocks = []

    for (let i = daysBack; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]

        // Get actual unlock amount for this date, or 0 if no unlocks
        const unlockAmount = completedByDate[dateStr] || 0

        pastUnlocks.push({
            date: dateStr,
            amount: unlockAmount,
        })
    }

    return { pastUnlocks }
}
