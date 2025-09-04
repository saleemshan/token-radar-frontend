import { getPrivyUser } from '@/utils/privyAuth'
import axios, { AxiosError } from 'axios'
import { NextResponse } from 'next/server'

export const maxDuration = 80

interface ErrorResponseData {
    error?: string
    details?: string
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { amount, originChainId, originCurrency } = body

        // Validate required parameters
        if (!amount || !originChainId || !originCurrency) {
            return NextResponse.json(
                {
                    error: 'Invalid request parameters',
                    details: 'Missing required fields: amount, originChainId, or originCurrency',
                },
                { status: 400 }
            )
        }

        const user = await getPrivyUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', details: 'User authentication required' }, { status: 401 })
        }

        const response = await axios.post(
            `${process.env.IGNAS_BACKEND_API_URL}/api/v1/hyperliquid/cross-chain-deposit`,
            {
                privyUserId: user.userId,
                amount,
                originChainId,
                originCurrency,
            },
            {
                headers: {
                    'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
            }
        )

        return NextResponse.json(response.data, { status: 200 })
    } catch (error: unknown) {
        const axiosError = error as AxiosError<ErrorResponseData>
        const status = axiosError.response?.status || 500
        const errorMessage = axiosError.response?.data?.error || 'Failed to process cross-chain deposit'
        const errorDetails = axiosError.response?.data?.details || axiosError.message || 'An unexpected error occurred'

        // Handle specific error cases
        if (status === 404) {
            return NextResponse.json({ error: 'Wallet not found', details: errorDetails }, { status })
        }

        return NextResponse.json({ error: errorMessage, details: errorDetails }, { status })
    }
}
