import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const getUserReferralCode = async (): Promise<UserReferralCode> => {
    const res = await axiosLib.get(`/api/user/referral`)

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.data
}

const updateUserReferralCode = async (payload: { newReferCode: string }) => {
    const res = await axiosLib.post('/api/user/referral/update-code', { newReferCode: payload.newReferCode })
    return res.data
}

const useUserReferralCode = () => {
    const { ready, authenticated, user } = usePrivy()

    return useQuery({
        queryKey: ['userReferralCode', user?.id],
        queryFn: async () => await getUserReferralCode(),
        enabled: Boolean(ready && authenticated && user),
    })
}

export const useMutateReferralCode = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: updateUserReferralCode,

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userReferralCode', user?.id] })
        },
    })
}

export default useUserReferralCode
