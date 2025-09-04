import { RelayChain } from '@/types/bridge'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const getRelayChains = async (): Promise<RelayChain[]> => {
    const response = await axios.get('/api/relay/chains')
    return response.data.chains.filter((chain: RelayChain) => chain.name === 'ethereum' || chain.name === 'solana' || chain.name === 'base')
}

const useRelayChains = () => {
    return useQuery({
        queryKey: ['relayChains'],
        queryFn: getRelayChains,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    })
}

export default useRelayChains
