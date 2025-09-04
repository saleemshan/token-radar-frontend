import { NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async () => {
    const user = await getPrivyUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await axios.get(`${process.env.REFERRAL_BACKEND_API_URL}/user/${user.userId}`, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'x-api-key': process.env.REFERRAL_BACKEND_API_KEY!,
            },
        })

        // Check the response body's code field to determine if user exists
        const responseData = response.data

        // Success code is 0, error codes like 6016803002 indicate user not found
        if (responseData.code === 0) {
            // User exists in referral system
            return NextResponse.json({ data: responseData }, { status: 200 })
        } else {
            // User not found (error code like 6016803002)
            return NextResponse.json({ error: 'User not found in referral system' }, { status: 404 })
        }
    } catch (error: unknown) {
        // Type guard for axios error
        const isAxiosError = (err: unknown): err is { response?: { status: number; data: unknown }; message: string } => {
            return typeof err === 'object' && err !== null && 'message' in err
        }

        // If 404 or user not found, they're a new user
        if (isAxiosError(error) && error.response?.status === 404) {
            return NextResponse.json({ error: 'User not found in referral system' }, { status: 404 })
        }

        // For other errors, return 500
        return NextResponse.json({ error: 'Failed to check user referral status' }, { status: 500 })
    }
}
