import { NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const maxDuration = 30

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { orders, params } = body

        const user = await getPrivyUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const response = await axios.post(
            `${process.env.IGNAS_BACKEND_API_URL}/api/v1/hyperliquid/place-orders`,
            {
                privyUserId: user.userId,
                orders,
                params,
            },
            {
                headers: {
                    'x-api-key': process.env.IGNAS_BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
            }
        )

        return NextResponse.json(response.data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const status = error.response?.status || 500
        return NextResponse.json({ error: error.response?.data || 'Failed to place orders' }, { status })
    }
}
