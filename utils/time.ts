export const getTimeComparison = (timestamp: string): string => {
    if (!timestamp) return '-'

    const now = new Date()
    const past = new Date(timestamp)
    if (isNaN(past.getTime())) return '-'
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    const secondsInMinute = 60
    const secondsInHour = secondsInMinute * 60
    const secondsInDay = secondsInHour * 24

    if (diffInSeconds < secondsInMinute) {
        return `${diffInSeconds}s`
    } else if (diffInSeconds < secondsInHour) {
        const minutes = Math.floor(diffInSeconds / secondsInMinute)
        return `${minutes}m`
    } else if (diffInSeconds < secondsInDay) {
        const hours = Math.floor(diffInSeconds / secondsInHour)
        return `${hours}h`
    } else {
        const days = Math.floor(diffInSeconds / secondsInDay)
        return `${days}d`
    }
}

export const formatDateForWalletActivity = (dateString: string): string => {
    const date = new Date(dateString)

    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }

    return new Intl.DateTimeFormat('en-US', options).format(date)
}

export function getUnixTimestamp(daysAgo: number = 0): number {
    // Create a new date object representing the current date in UTC
    const now = new Date()

    // Calculate the timestamp by subtracting the number of days in milliseconds
    const adjustedDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo)

    // Return the Unix timestamp (seconds since January 1, 1970, 00:00:00 UTC)
    return Math.floor(adjustedDate.getTime() / 1000)
}

export function generateTimestampObject(days: number = 60): Record<string, number> {
    const timestampObject: Record<string, number> = {}

    for (let i = 0; i <= days; i++) {
        const timestamp = getUnixTimestamp(i).toString()
        const randomValue = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000

        timestampObject[timestamp] = randomValue
    }

    return timestampObject
}

export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Etc/UTC'
}

export function getNewsFeedTime(timestamp: string, timeZone = ''): string {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '-'

    // Using Intl.DateTimeFormat to format time in the specified timezone
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    return timeFormatter.format(date)
}

export function getNewsFeedDate(timestamp: string, timeZone = ''): string {
    const date = new Date(timestamp)

    if (isNaN(date.getTime())) {
        return 'Invalid timestamp'
    }

    // Using Intl.DateTimeFormat to format date in the specified timezone
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        day: '2-digit',
        month: 'short',
    })

    const parts = dateFormatter.formatToParts(date)
    let day, month

    for (const part of parts) {
        if (part.type === 'day') day = part.value
        if (part.type === 'month') month = part.value
    }

    return `${day} ${month}`
}

export function getReadableDetailDate(isoString?: string, userTimezone: string = 'Asia/Singapore'): string {
    if (!isoString) return '-'
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return '-'

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: userTimezone,
    }

    return new Intl.DateTimeFormat('en-GB', options).format(date)
}

export function getReadableUnixTimestamp(timestamp: number, timezone: string = 'UTC'): string {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '-'

    const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }

    const formatter = new Intl.DateTimeFormat('en-GB', options)

    const parts = formatter.formatToParts(date)

    const getPart = (type: string) => {
        const value = parts.find(p => p.type === type)?.value
        if (!value) return '00'
        return type === 'year' ? value : value.padStart(2, '0')
    }

    return `${getPart('day')}/${getPart('month')}/${getPart('year')}, ${getPart('hour')}:${getPart('minute')}:${getPart('second')}`
}
