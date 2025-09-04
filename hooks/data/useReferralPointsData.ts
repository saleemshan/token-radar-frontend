import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

const getData = async (): Promise<UserReferralPoints> => {
    const res = await axiosLib.get(`/api/user/referral/points`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

const useUserReferralPointsData = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['userReferralPoints', user?.id],
        queryFn: async () => await getData(),
        enabled: Boolean(ready && authenticated && user),
        refetchOnMount: true,
    })
}

export default useUserReferralPointsData
