import { NewsCategory, NewsType, SentimentDirection, SentimentMomentum } from '@/types/newstrading'

export const NEWS_TYPES: { label: string; value: NewsType }[] = [
    { label: 'Crypto', value: 'crypto' },
    { label: 'TradFi', value: 'tradfi' },
    { label: 'Social', value: 'social' },
]
export const IMPACT_SCORES: { label: string; value: SentimentMomentum }[] = [
    { label: 'Low', value: 'Low' },
    { label: 'Neutral', value: 'Neutral' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
]

export const SENTIMENTS: { label: string; value: SentimentDirection }[] = [
    { label: 'Bullish', value: 'Bullish' },
    { label: 'Neutral', value: 'Neutral' },
    { label: 'Bearish', value: 'Bearish' },
]

export const CATEGORIES: { label: NewsCategory; value: NewsCategory }[] = [
    { label: 'Regulation', value: 'Regulation' },
    { label: 'Macro', value: 'Macro' },
    { label: 'Institutional', value: 'Institutional' },
    { label: 'Infrastructure', value: 'Infrastructure' },
    { label: 'Markets', value: 'Markets' },
    { label: 'DeFi', value: 'DeFi' },
    { label: 'Memecoins', value: 'Memecoins' },
    { label: 'Culture', value: 'Culture' },
    { label: 'Security', value: 'Security' },
    { label: 'Bitcoin Strategy', value: 'Bitcoin Strategy' },
]

export const NRS_ACTIONS = [
    { label: 'Buy', value: 'buy' },
    { label: 'Fade', value: 'fade' },
    { label: 'Watch', value: 'watch' },
    { label: 'Ignore', value: 'ignore' },
]

export const TICKERS: string[] = ['AAVE', 'ACA', 'ALPACA']

export const NEWS_SOURCES_OPTIONS = ['@MMSnews', '@aggrnews', '@TreeNewsFeed', '@WatcherGuru', '@ZoomerfiedNews', '@wublockchainenglish']
export const NEWS_SOURCES_DEFAULT = ['Ambush News', 'BWE News']

export const TRADFI_SOURCES_OPTIONS = ['@trad_fin', '@zerohedge', '@solidintel_x', '@infinityhedge', '@DeItaone']
export const TRADFI_SOURCES_DEFAULT = []

export const SOCIAL_SOURCES_OPTIONS = ['@doge', '@donaldjtrumpjr', '@ericbalchunas', '@elonmusk', '@worldlibertyfi', '@sama']
export const SOCIAL_SOURCES_DEFAULT = []
