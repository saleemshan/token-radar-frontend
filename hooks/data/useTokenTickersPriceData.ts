import useIsMobile from '@/hooks/useIsMobile'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
const getData = async (tickers?: string): Promise<TickerPrice[]> => {
    if (!tickers) throw new Error('Tickers is required')

    const res = await axios.get(`/api/tickers/price`, {
        params: { tickers },
    })

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

const useTokenTickerPriceData = (tickers: string, enabledOnMobile: boolean = true) => {
    const isMobile = useIsMobile()

    return useQuery({
        queryKey: ['tokenTickerPriceData', tickers],
        queryFn: () => getData(tickers),
        enabled: Boolean(tickers) && !enabledOnMobile ? !isMobile : true,
        refetchInterval: 60000,
    })
}

export default useTokenTickerPriceData
