import { useQuery } from '@tanstack/react-query'
import axiosLib from '@/lib/axios'

interface UserReferralCheckResponse {
    data?: {
        code: number
        message: string
        data?: {
            exists?: boolean
        }
    }
    error?: string
}

export const useUserReferralCheck = () => {
    return useQuery({
        queryKey: ['userReferralCheck'],
        queryFn: async (): Promise<UserReferralCheckResponse> => {
            try {
                const res = await axiosLib.get('/api/user/referral')
                return res.data
            } catch (error) {
                // If user doesn't exist in referral system, they're new
                const isAxiosError = (err: unknown): err is { response?: { status: number; data: unknown }; message: string } => {
                    return typeof err === 'object' && err !== null && 'message' in err
                }

                if (isAxiosError(error) && error.response?.status === 404) {
                    return {
                        data: {
                            code: 6016803002, // User not found code
                            message: 'User not found in referral system',
                            data: { exists: false },
                        },
                    }
                }
                throw error
            }
        },
        retry: false,
        refetchOnWindowFocus: false,
    })
}
