import { SentimentDirection, SentimentMomentum } from '@/types/newstrading'

export const getBorderColor = (direction: SentimentDirection, momentum: SentimentMomentum) => {
    if (!direction || !momentum) {
        return 'rgb(25 25 25)'
    }

    if (direction.toLowerCase() === 'bullish' && momentum.toLowerCase() === 'high') {
        // return 'border-positive/40 animate-glowing-positive-border'
        return 'rgb(128 255 108 / 0.4)'
    }

    if (direction.toLowerCase() === 'bearish' && momentum.toLowerCase() === 'high') {
        // return 'border-negative/40  animate-glowing-negative-border'
        return 'rgb(255 24 80 / 0.4)'
    }

    return 'rgb(25 25 25)'
}

export const getImpactLabel = (direction: SentimentDirection) => {
    let textColor = ''

    switch (direction.toLowerCase()) {
        case 'bullish':
            textColor = 'text-positive'
            break
        case 'bearish':
            textColor = 'text-negative'
            break
        default:
            textColor = 'text-neutral-text'
            break
    }

    return textColor
}

export const getTypeLabel = (type: string) => {
    if (type === 'bwe') {
        return 'BWEnews'
    } else if (type === 'ambush') {
        return 'Ambush'
    } else {
        return type
    }
}
