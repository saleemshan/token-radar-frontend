import axiosLib from '@/lib/axios'
import { NewsFeedPreferences } from '@/types/newstrading'
import { usePrivy } from '@privy-io/react-auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export class NewsFeedPreferencesError extends Error {
    type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any
    args: string[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(message: string, type: string, response: any, args: string[]) {
        super(message)
        this.name = 'CustomError'
        this.type = type
        this.response = response
        this.args = args
    }
}

export const getData = async (): Promise<NewsFeedPreferences> => {
    const res = await axiosLib.get(`/api/news-trading/preferences`, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data
}

export const useNewsFeedPreferencesData = () => {
    const { ready, authenticated, user } = usePrivy()
    return useQuery({
        queryKey: ['newsFeedPreferences', user?.id],
        queryFn: async () => await getData(),
        enabled: Boolean(ready && authenticated && user),
        // retry: false,
        // refetchOnWindowFocus: false,
    })
}

const updateData = async (params: NewsFeedPreferences) => {
    const response = await axiosLib.post(`/api/news-trading/preferences`, params, {
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (response.data.code !== 0) {
        let errorMessage = ''
        let type = ''
        const args = response.data.args
        const errorCode = response.data.code

        switch (errorCode) {
            case 3011405001:
                errorMessage = `Twitter lists content are empty.`
                type = 'list'
                break
            case 3011500000:
                errorMessage = `Twitter lists need to be valid and public X list.`
                type = 'list'
                break
            case 3011405002:
                errorMessage = `Twitter accounts do not contain any tweets.`
                type = 'user'
                break
            case 3011405003:
                errorMessage = `Twitter accounts do not contain any information.`
                type = 'user'
                break
            default:
                errorMessage = 'Something went wrong, try again later.'
                type = 'user'
                break
        }

        throw new NewsFeedPreferencesError(
            errorMessage,
            type,
            response.data,
            args // Include the full response data
        )
    }

    return response.data
}

export const useMutateNewsFeedPreferencesData = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: (params: NewsFeedPreferences) => updateData(params),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['newsFeedPreferences', user?.id],
            })
        },
    })
}
