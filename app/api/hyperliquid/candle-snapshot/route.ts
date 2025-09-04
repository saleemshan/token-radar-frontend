import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
    try {
        const { coin, endTime, interval = '15m', startTime } = await request.json()

        if (!coin || !endTime || !interval || !startTime) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        const response = await axios.post(
            `${process.env.BACKEND_API_URL}/hyperliquid/candle-snapshot`,
            {
                coin,
                endTime,
                interval,
                startTime,
            },
            {
                headers: {
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
            }
        )
        return NextResponse.json(response.data, { status: 200 })
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        const status = error.response?.status || 500
        return NextResponse.json({ error: error.response?.data || 'Failed to get candle snapshot' }, { status })
    }
}
