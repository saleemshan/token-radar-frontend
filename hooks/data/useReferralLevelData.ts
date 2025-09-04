import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'

const getData = async (): Promise<UserReferralLevel> => {
    const res = await axiosLib.get(`/api/user/referral/level`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.data
}

const useUserReferralLevelData = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['userReferralLevel', user?.id],
        queryFn: async () => await getData(),
        enabled: Boolean(ready && authenticated && user),
    })
}

export default useUserReferralLevelData
