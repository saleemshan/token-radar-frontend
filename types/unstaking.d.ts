interface UnstakingQueueItem {
    time: number
    timestamp: string
    user_address: string
    wei: number
}

interface UnstakingQueueData {
    total_items: number
    total_wei: number
    queue: UnstakingQueueItem[]
}

interface UnstakingQueueResponse {
    code: number
    message: string
    data: UnstakingQueueData
}

interface UnstakingChartDataPoint {
    date: string
    balance: number
}

interface TransformedUnstakingItem {
    id: string
    timestamp: string
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    minutesLeft: number
}
