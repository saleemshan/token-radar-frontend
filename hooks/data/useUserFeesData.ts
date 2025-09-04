import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type UserFeesResponseData = {
    dailyUserVlm: {
        date: string
        userCross: string
        userAdd: string
        exchange: string
    }[]
    feeSchedule: {
        cross: string
        add: string
        spotCross: string
        spotAdd: string
        tiers: {
            vip: {
                ntlCutoff: string
                cross: string
                add: string
                spotCross: string
                spotAdd: string
            }[]
            mm: {
                makerFractionCutoff: string
                add: string
            }[]
        }
        referralDiscount: string
        stakingDiscountTiers: {
            bpsOfMaxSupply: string
            discount: string
        }[]
    }
    userCrossRate: string
    userAddRate: string
    userSpotCrossRate: string
    userSpotAddRate: string
    activeReferralDiscount: string
    trial: null | string
    feeTrialReward: string
    nextTrialAvailableTimestamp: null | number
    stakingLink: null | string
    activeStakingDiscount: {
        bpsOfMaxSupply: string
        discount: string
    }
}

interface UserFeesResponse {
    code: number
    data: UserFeesResponseData
}

export const useUserFeesData = (userAddress?: string) => {
    return useQuery({
        queryKey: ['userFees', userAddress],
        queryFn: async (): Promise<UserFeesResponseData> => {
            if (!userAddress) {
                throw new Error('User address is required')
            }

            const response = await axios.post<UserFeesResponse>('/api/hyperliquid/user-fees', {
                user: userAddress ?? '0x0000000000000000000000000000000000000000',
            })

            return response.data.data
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}
