export const getStatusColor = (status: TradingViewStreamingStatusEvent['status']) => {
    switch (status) {
        case 'connecting':
            return '#22c55e'
        // return '#3b82f6';
        case 'online':
            return '#80FF6C'
        case 'error':
            return '#FF1850'
        case 'offline':
            return '#FF1850'
        default:
            return '#222222'
    }
}
