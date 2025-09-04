import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

const getUserReferralRate = async (): Promise<UserReferralRate> => {
    const res = await axiosLib.get(`/api/user/referral/rate`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.data
}

const useUserReferralRate = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['userReferralRate', user?.id],
        queryFn: async () => await getUserReferralRate(),
        enabled: Boolean(ready && authenticated && user),
    })
}

export default useUserReferralRate
