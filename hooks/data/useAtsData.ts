import axiosLib from '@/lib/axios'
import { usePrivy } from '@privy-io/react-auth'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const getAts = async (
    page: number,
    limit: number,
    isPerps: boolean
): Promise<{
    strategies: Strategy[]
    pagination: {
        current: number
        pageSize: number
        total: number
        totalPages: number
    }
}> => {
    const res = await axiosLib.get(`/api/ats`, {
        params: { page, limit, isPerps },
    })

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
        throw new Error('No data found')
    }

    return res.data.data.data
}

const useAtsData = (page: number, limit: number, isPerps = false) => {
    const { authenticated, user } = usePrivy()

    return useQuery({
        queryKey: ['ats', 'list', user?.id, page, limit, isPerps],
        enabled: Boolean(authenticated),
        queryFn: async () => await getAts(page, limit, isPerps),
        refetchOnMount: false,
        refetchOnWindowFocus: true,
    })
}

export default useAtsData

export const useAtsExploreData = (page: number, limit: number, isPerps = false) => {
    const { authenticated } = usePrivy()

    return useQuery({
        queryKey: ['ats', 'explore', page, limit, isPerps],
        enabled: Boolean(authenticated),
        queryFn: async (): Promise<{
            strategies: Strategy[]
            pagination: {
                current: number
                pageSize: number
                total: number
                totalPages: number
            }
        }> => {
            // await getExploreAts(page, limit);
            const res = await axiosLib.get(`/api/ats/explore`, {
                params: { page, limit, isPerps },
            })

            if (!res.data.data || Object.keys(res.data.data).length === 0) {
                throw new Error('No data found')
            }

            return res.data.data
        },
        refetchOnMount: false,
        refetchOnWindowFocus: true,
    })
}

export const useSingleAtsData = (id: string, isPerps = false) => {
    const { authenticated, user } = usePrivy()

    return useQuery({
        queryKey: ['ats', user?.id, id, isPerps],
        enabled: Boolean(authenticated && id),
        queryFn: async () => {
            const res = await axiosLib.get(`/api/ats/${id}`, { params: { isPerps } })

            if (!res.data.data || Object.keys(res.data.data).length === 0) {
                throw new Error('No data found')
            }

            return res.data.data
        },
        refetchOnMount: false,
        refetchOnWindowFocus: true,
    })
}

const createNewAts = async (params: { strategy: Strategy }, isPerps = false) => {
    const response = await axiosLib.post(
        `/api/ats`,
        { ...params.strategy },
        {
            headers: {
                'Content-Type': 'application/json',
            },
            params: { isPerps },
        }
    )
    return response.data
}

export const useMutateCreateATS = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: (params: { strategy: Strategy; isPerps?: boolean }) => createNewAts(params, params.isPerps ?? false),

        onSuccess: () => {
            const queryKeyPrefix = ['ats', 'list', user?.id]

            queryClient.invalidateQueries({
                predicate: query => {
                    const queryKey = query.queryKey as unknown[]
                    return queryKey.length >= queryKeyPrefix.length && queryKeyPrefix.every((value, index) => value === queryKey[index])
                },
            })

            // queryClient.refetchQueries({
            //   queryKey: ['ats', user?.id],
            // });
        },

        onError: error => {
            console.log('error', error)
        },
    })
}

export const useMutateUpdateATS = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: async (params: { strategy: Strategy; isPerps?: boolean }) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const response = await axiosLib.post(
                `/api/ats/${params.strategy.strategyId}`,
                { ...params.strategy },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: { isPerps: params.isPerps ?? false },
                }
            )

            return params.strategy
        },

        onSuccess: (data: Strategy) => {
            queryClient.setQueryData(['ats', user?.id, data.strategyId], () => {
                return { ...data }
            })

            queryClient.invalidateQueries({
                predicate: query => {
                    const qKey = query.queryKey
                    return Array.isArray(qKey) && qKey[0] === 'ats' && qKey[1] === 'list' && qKey[2] === user?.id
                },
            })

            queryClient.invalidateQueries({
                queryKey: ['ats', user?.id, data.strategyId],
            })
        },

        onError: error => {
            console.log('error', error)
        },
    })
}

export const useMutateDeleteATS = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: async (params: { strategyId: string; isPerps?: boolean }) => {
            await axiosLib.delete(`/api/ats/${params.strategyId}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                params: { isPerps: params.isPerps ?? false },
            })
            // console.log(response.data)

            return params.strategyId
        },

        onSuccess: () => {
            const queryKeyPrefix = ['ats', 'list', user?.id]

            queryClient.removeQueries({
                predicate: query => {
                    const queryKey = query.queryKey as unknown[]
                    return queryKey.length >= queryKeyPrefix.length && queryKeyPrefix.every((value, index) => value === queryKey[index])
                },
            })
        },

        onError: error => {
            console.log('error', error)
        },
    })
}

export const useMutateToggleATS = () => {
    const queryClient = useQueryClient()
    const { user } = usePrivy()
    return useMutation({
        mutationFn: async (params: { strategyId: string; newState: boolean; isPerps?: boolean }) => {
            await axiosLib.post(
                `/api/ats/${params.strategyId}/toggle`,
                {
                    newState: params.newState,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    params: { isPerps: params.isPerps ?? false },
                }
            )

            // return response.data;
            return params.strategyId
        },

        onSuccess: data => {
            // const newStrategy = data.message.data;

            const queryKeyPrefix = ['ats', 'list', user?.id]

            queryClient.setQueryData(['ats', user?.id, data], (oldStrategy: Strategy) => {
                return { ...oldStrategy, isRunning: !oldStrategy.isRunning }
            })

            queryClient.removeQueries({
                predicate: query => {
                    const queryKey = query.queryKey as unknown[]
                    return queryKey.length >= queryKeyPrefix.length && queryKeyPrefix.every((value, index) => value === queryKey[index])
                },
            })
        },

        onError: error => {
            console.log('error', error)
        },
    })
}
