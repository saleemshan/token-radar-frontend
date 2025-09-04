import axiosLib from '@/lib/axios'
import { UserNotificationPreferences, UserNotificationPreferencesParams } from '@/types/pushnotifications'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const getData = async (): Promise<UserNotificationPreferences> => {
    const res = await axiosLib.get(`/api/notifications`, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

export const useUserNotificationPreferencesData = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['userNotificationPreferences', user?.id],
        queryFn: async () => await getData(),
        enabled: Boolean(ready && authenticated && user),
        // retry: false,
        // refetchOnWindowFocus: false,
    })
}

const updateData = async (params: UserNotificationPreferencesParams) => {
    const response = await axiosLib.post(`/api/notifications`, params, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    return response.data
}

export const useMutateUserNotificationPreferencesData = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: (params: UserNotificationPreferencesParams) => updateData(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['userNotificationPreferences', user?.id],
            })
        },
    })
}
