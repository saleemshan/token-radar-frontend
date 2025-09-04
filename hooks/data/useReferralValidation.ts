import axiosLib from '@/lib/axios'
import { useMutation } from '@tanstack/react-query'

interface ReferralValidationResponse {
    valid: boolean
    referralCode: string
    data?: {
        exists: boolean
        referCode: string
        user: {
            privyId: string
            referCode: string
            isKol: boolean
        }
    }
    error?: string
}

const validateReferralCode = async (referralCode: string): Promise<ReferralValidationResponse> => {
    const res = await axiosLib.post('/api/referral/validate', { referralCode })
    return res.data
}

export const useReferralValidation = () => {
    return useMutation({
        mutationFn: validateReferralCode,
    })
}
