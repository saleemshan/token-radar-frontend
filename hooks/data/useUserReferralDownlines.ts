import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery } from '@tanstack/react-query'
const getUserReferralDownlines = async (): Promise<UserReferralDownlines> => {
    const res = await axiosLib.get(`/api/user/referral/downlines`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.data
}

const useUserReferralDownlines = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['userReferralDownline', user?.id],
        queryFn: async () => await getUserReferralDownlines(),
        enabled: Boolean(ready && authenticated && user),
        refetchOnMount: true,
    })
}

export default useUserReferralDownlines
