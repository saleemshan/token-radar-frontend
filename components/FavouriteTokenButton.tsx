'use client'
import React, { useEffect, useState } from 'react'
import { FaStar } from 'react-icons/fa'
import { useUser } from '@/context/UserContext'
import { useMutateUserFavouriteTokensData } from '@/hooks/data/useUserFavouriteTokensData'
import Spinner from './Spinner'
import { useLogin, usePrivy } from '@privy-io/react-auth'

const FavouriteTokenButton = ({
    tokenData,
    stopPropagation = true,
    className,
}: {
    tokenData: Token | undefined
    className?: string
    stopPropagation?: boolean
}) => {
    const { authenticated, ready } = usePrivy()
    const { favouriteTokens } = useUser()
    const { mutate, isPending: isSetFavouriteTokensPending } = useMutateUserFavouriteTokensData()
    const [isFavourite, setIsFavourite] = useState(false)

    const { login: handleSignIn } = useLogin()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFavouriteToken = (event: any) => {
        if (stopPropagation) {
            event.stopPropagation()
        }

        if (!tokenData) return

        if (ready && authenticated) {
            const foundToken = favouriteTokens.find(token => token.address === tokenData.address)

            const params = {
                chain: tokenData.chain_id,
                tokenAddress: tokenData.address,
                favourite: true,
                logo: tokenData.image?.icon,
                name: tokenData.name,
                symbol: tokenData.symbol,
            }

            if (foundToken) {
                params.favourite = false
            }
            mutate(params)
        } else {
            handleSignIn()
        }
    }

    useEffect(() => {
        if (isSetFavouriteTokensPending || !tokenData) return
        const foundToken = favouriteTokens.find(token => token.address === tokenData.address)

        if (foundToken) {
            return setIsFavourite(true)
        }
        return setIsFavourite(false)
    }, [favouriteTokens, setIsFavourite, tokenData, isSetFavouriteTokensPending])

    return (
        <button
            type="button"
            className={` min-w-5 max-w-5 flex items-center justify-center ${
                isFavourite ? 'text-yellow-500' : 'text-neutral-text-dark/70'
            } ${className}`}
            onClick={handleFavouriteToken}
        >
            {isSetFavouriteTokensPending ? <Spinner className="text-neutral-text" /> : <FaStar />}
        </button>
    )
}

export default FavouriteTokenButton
