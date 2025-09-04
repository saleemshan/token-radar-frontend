import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/hyperliquid/market-data`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })
        return NextResponse.json(response.data, { status: 200 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const status = error.response?.status || 500
        return NextResponse.json({ error: error.response?.data || 'Failed to cancel order' }, { status })
    }
}
