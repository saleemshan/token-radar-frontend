import axios from 'axios'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { user: userAddress, startTime, endTime, aggregateByTime } = body

        const response = await axios.post(
            `${process.env.BACKEND_API_URL}/hyperliquid/user-fills`,
            {
                user: userAddress,
                startTime,
                endTime,
                aggregateByTime,
            },
            {
                headers: {
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
            }
        )
        return NextResponse.json(response.data, { status: 200 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const status = error.response?.status || 500
        return NextResponse.json({ error: error.response?.data || 'Failed to fetch user fills' }, { status })
    }
}
