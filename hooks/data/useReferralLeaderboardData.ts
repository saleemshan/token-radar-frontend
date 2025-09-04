import axiosLib from '@/lib/axios'
import { useQuery } from '@tanstack/react-query'

const getData = async (): Promise<ReferralLeaderBoard> => {
    const res = await axiosLib.get(`/api/user/referral/leaderboard`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.leaderboard
}

const useUserReferralLeaderboardData = () => {
    // const { ready, authenticated, user } = usePrivy();
    return useQuery({
        queryKey: ['userReferralLeaderboard'],
        queryFn: async () => await getData(),
        // enabled: Boolean(ready && authenticated && user),
        refetchOnMount: true,
    })
}

export default useUserReferralLeaderboardData
