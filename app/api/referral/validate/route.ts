import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'

export const POST = async (request: NextRequest) => {
    const { referralCode } = await request.json()

    if (!referralCode) {
        return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    try {
        const response = await axios.get(`${process.env.REFERRAL_BACKEND_API_URL}/user/refer-code/${encodeURIComponent(referralCode)}/exists`, {
            headers: {
                accept: 'application/json',
                'x-api-key': process.env.REFERRAL_BACKEND_API_KEY!,
            },
        })

        // Check the response body's code field to determine if referral code is valid
        const responseData = response.data

        // Success code is 0, and data.exists should be true for valid codes
        if (responseData.code === 0 && responseData.data?.exists === true) {
            // Referral code is valid
            return NextResponse.json(
                {
                    valid: true,
                    referralCode: referralCode,
                    data: responseData.data,
                },
                { status: 200 }
            )
        } else {
            // Referral code not found or invalid
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid referral code',
                },
                { status: 400 }
            )
        }
    } catch (error: unknown) {
        // Type guard for axios error
        const isAxiosError = (err: unknown): err is { response?: { status: number; data: unknown }; message: string } => {
            return typeof err === 'object' && err !== null && 'message' in err
        }

        // If 404 or referral code not found, it's invalid
        if (isAxiosError(error) && error.response?.status === 404) {
            return NextResponse.json(
                {
                    valid: false,
                    error: 'Invalid referral code',
                },
                { status: 400 }
            )
        }

        // For other errors, assume invalid
        return NextResponse.json(
            {
                valid: false,
                error: 'Invalid referral code',
            },
            { status: 400 }
        )
    }
}
