'use client'
import { chains } from '@/data/default/chains'
import useUserReferralCode from '@/hooks/data/useUserReferralCode'
import useIsMobile from '@/hooks/useIsMobile'
import { getVisitorId } from '@/lib/fingerprint'
import { BASE_URL } from '@/utils/string'
import { useLogout, usePrivy } from '@privy-io/react-auth'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { createContext, useState, ReactNode, useContext, useEffect } from 'react'

interface UserContextProps {
    showAlphaFeed: boolean
    showAIAssistant: boolean
    showTooltips: boolean
    showFavouritesPanel: boolean
    chain: Chain
    setChain: (chain: Chain) => void
    setShowAlphaFeed: (show: boolean) => void
    setShowAIAssistant: (show: boolean) => void
    setShowFavouritesPanel: (show: boolean) => void
    toggleAlphaFeed: () => void
    toggleAIAssistant: () => void
    toggleTooltips: () => void
    toggleFavouritesPanel: () => void
    userPublicWalletAddress: string | undefined
    userReferralLink: string | undefined
    setUserPublicWalletAddress: (address: string | undefined) => void
    clearUserPublicWalletAddresses: () => void

    userPublicWalletAddresses: UserPublicWalletAddresses
    setUserPublicWalletAddresses: (chainId: ChainId, address: string) => void
    isEthWalletAddressFetched: boolean
    isEthWalletAddressFetching: boolean
    setIsEthWalletAddressFetched: (isFetched: boolean) => void
    setIsEthWalletAddressFetching: (isFetching: boolean) => void
    handleLogout: () => void

    favouriteTokens: FavouriteToken[]
    setFavouriteTokens: (tokens: FavouriteToken[]) => void

    lastSelectedToken: { address: string; chain: string } | undefined
    setLastSelectedToken: (token: { address: string; chain: string } | undefined) => void

    fingerprint: string | undefined
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

const getStoredValue = (key: string, defaultValue: boolean) => {
    if (typeof window === 'undefined') return defaultValue
    const storedValue = localStorage.getItem(key)
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const isMobile = useIsMobile()
    const { ready, authenticated } = usePrivy()
    const [lastSelectedToken, setLastSelectedToken] = useState<{ address: string; chain: string } | undefined>(undefined)
    const [showAlphaFeed, setShowAlphaFeed] = useState(false)
    const [showAIAssistant, setShowAIAssistant] = useState(false)
    const [showFavouritesPanel, setShowFavouritesPanel] = useState(false)
    const [showTooltips, setShowTooltips] = useState(false)
    const [userPublicWalletAddress, setUserPublicWalletAddress] = useState<string | undefined>(undefined)
    const [userReferralLink, setUserReferralLink] = useState<string | undefined>(undefined)
    const [isEthWalletAddressFetched, setIsEthWalletAddressFetched] = useState(false)
    const [isEthWalletAddressFetching, setIsEthWalletAddressFetching] = useState(true)

    const { logout: handleSignOut } = useLogout()
    const router = useRouter()
    const { user } = usePrivy()
    const queryClient = useQueryClient()
    const [fingerprint, setFingerprint] = useState<string | undefined>(undefined)

    const [favouriteTokens, setFavouriteTokens] = useState<FavouriteToken[]>([])

    const [chain, setChain] = useState<Chain>(chains[0])

    const isTab = useIsMobile(1024)

    const [userPublicWalletAddresses, setUserPublicWalletAddressesState] = useState<UserPublicWalletAddresses>({
        solana: '',
        ethereum: '',
        base: '',
        bsc: '',
        arbitrum: '',
        hyperliquid: '',
    })

    const { data: userReferralCode } = useUserReferralCode()

    const setUserPublicWalletAddresses = (chainId: ChainId, address: string) => {
        setUserPublicWalletAddressesState(prevAddresses => ({
            ...prevAddresses,
            [chainId]: address,
        }))
    }

    const clearUserPublicWalletAddresses = () => {
        setUserPublicWalletAddressesState({
            solana: '',
            ethereum: '',
            base: '',
            bsc: '',
            arbitrum: '',
            hyperliquid: '',
        })
    }

    const toggleAlphaFeed = () => {
        setShowAlphaFeed((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem('showAlphaFeed', JSON.stringify(newValue))
            return newValue
        })
    }

    const toggleAIAssistant = () => {
        setShowAIAssistant((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem('showAIAssistant', JSON.stringify(newValue))
            return newValue
        })
    }

    const toggleTooltips = () => {
        setShowTooltips((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem('showTooltips', JSON.stringify(newValue))
            return newValue
        })
    }

    const toggleFavouritesPanel = () => {
        setShowFavouritesPanel((prev: boolean) => {
            const newValue = !prev
            localStorage.setItem('showFavouritesPanel', JSON.stringify(newValue))
            return newValue
        })
    }

    const handleLogout = () => {
        if (user?.id) {
            queryClient.removeQueries({
                predicate: query => {
                    return query.queryKey.some(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (key: any) => typeof key === 'string' && key.includes(user.id)
                    )
                },
            })
        }
        clearUserPublicWalletAddresses()
        handleSignOut()
        router.push('/')
    }

    useEffect(() => {
        const lastChain = localStorage.getItem('chain')
        setChain(lastChain && lastChain !== 'undefined' ? (JSON.parse(lastChain) as Chain) : chains[0])

        async function getUserFingerprint() {
            const userFingerprint = await getVisitorId()
            if (userFingerprint) setFingerprint(userFingerprint)
        }

        getUserFingerprint()
    }, [])

    useEffect(() => {
        if (chain) {
            localStorage.setItem('chain', JSON.stringify(chain))
        }
    }, [chain])

    useEffect(() => {
        if (userReferralCode) {
            setUserReferralLink(`${BASE_URL}?ref=${userReferralCode.referCode}`)
        }
    }, [userReferralCode])

    useEffect(() => {
        setShowAlphaFeed(getStoredValue('showAlphaFeed', isMobile ? false : true))
        setShowFavouritesPanel(getStoredValue('showFavouritesPanel', isMobile ? false : true))

        if (process.env.NEXT_PUBLIC_ENABLE_AI_COMPANION) {
            setShowAIAssistant(getStoredValue('showAIAssistant', false))
        } else {
            setShowAIAssistant(false)
        }

        setShowTooltips(getStoredValue('showTooltips', false))
    }, [isMobile])

    useEffect(() => {
        if (isTab) {
            if (showFavouritesPanel) {
                setShowFavouritesPanel(false)
                localStorage.setItem('showFavouritesPanel', JSON.stringify(false))
            }

            if (showAlphaFeed) {
                setShowAlphaFeed(false)
                localStorage.setItem('showAlphaFeed', JSON.stringify(false))
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTab])

    useEffect(() => {
        if (ready && !authenticated) {
            setIsEthWalletAddressFetching(false)
        }
        if (isEthWalletAddressFetched) {
            setIsEthWalletAddressFetching(false)
        }
    }, [isEthWalletAddressFetched, ready, authenticated])

    return (
        <UserContext.Provider
            value={{
                fingerprint,
                handleLogout,
                userReferralLink,
                showAlphaFeed,
                showAIAssistant,
                showTooltips,
                showFavouritesPanel,
                setShowAlphaFeed,
                setShowAIAssistant,
                setShowFavouritesPanel,
                toggleAlphaFeed,
                toggleAIAssistant,
                toggleTooltips,
                toggleFavouritesPanel,
                userPublicWalletAddress,
                setUserPublicWalletAddress,
                userPublicWalletAddresses,
                setUserPublicWalletAddresses,
                clearUserPublicWalletAddresses,
                chain,
                setChain,
                favouriteTokens,
                setFavouriteTokens,
                lastSelectedToken,
                setLastSelectedToken,
                isEthWalletAddressFetched,
                isEthWalletAddressFetching,
                setIsEthWalletAddressFetched,
                setIsEthWalletAddressFetching,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
