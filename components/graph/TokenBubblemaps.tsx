import React, { useEffect, useState } from 'react'
import Spinner from '@/components/Spinner'
import useBubblemapsAvailabilityData from '@/hooks/data/useBubblemapsAvailability'
import EmptyData from '../global/EmptyData'

interface Props {
    tokenData: Token
}

const TokenBubblemaps = ({ tokenData }: Props) => {
    const [bubblemapsAvailable, setBubblemapsAvailable] = useState(false)

    const getBubblemapsChain = (chainId: ChainId) => {
        switch (chainId) {
            case 'solana':
                return 'sol'
            case 'ethereum':
                return 'eth'
            case 'base':
                return 'base'
            case 'bsc':
                return 'bsc'
            default:
                return 'sol'
        }
    }

    const { data, isLoading } = useBubblemapsAvailabilityData(tokenData.address, getBubblemapsChain(tokenData.chain_id))

    useEffect(() => {
        if (data) {
            setBubblemapsAvailable(data.availability)
        }
        // console.log('bubblemaps', data);
    }, [data])

    if (!isLoading) {
        return (
            <div className="flex-1 flex flex-col w-full justify-center items-center">
                {data && bubblemapsAvailable ? (
                    <iframe
                        src={`https://app.bubblemaps.io/${getBubblemapsChain(tokenData.chain_id)}/token/${tokenData.address}`}
                        className="w-full h-full border-none flex-1"
                        title="Token Bubblemaps"
                    ></iframe>
                ) : (
                    <EmptyData />
                )}
            </div>
        )
    } else {
        return (
            <div className="flex-1 flex flex-col w-full justify-center items-center">
                <Spinner className=" text-neutral-text-dark" size={36} borderWidth={3} />
            </div>
        )
    }
}

export default TokenBubblemaps
