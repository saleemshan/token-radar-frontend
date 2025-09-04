import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/unstaking-queue`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })

        return NextResponse.json(response.data, { status: 200 })
        /* eslint-disable @typescript-eslint/no-explicit-any */
    } catch (error: any) {
        console.error('Error fetching unstaking queue:', error)
        const status = error.response?.status || 500
        return NextResponse.json(
            {
                error: error.response?.data || 'Failed to fetch unstaking queue data',
            },
            { status }
        )
    }
}
