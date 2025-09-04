import { NextResponse } from 'next/server'
import axios from 'axios'

export const maxDuration = 30

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const response = await axios.post(
            `${process.env.BACKEND_API_URL}/hyperliquid/agent`,
            {
                ...body,
            },
            {
                headers: {
                    'x-api-key': process.env.BACKEND_API_KEY!,
                    'Content-Type': 'application/json',
                },
            }
        )

        if (response.data.data.status === 'err') {
            return NextResponse.json({ error: response.data.data.response || 'Failed to create agent' }, { status: 400 })
        }

        return NextResponse.json(response.data, { status: 200 })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const status = error.response?.status || 500
        return NextResponse.json({ error: error.response?.data || 'Failed to create agent' }, { status })
    }
}
