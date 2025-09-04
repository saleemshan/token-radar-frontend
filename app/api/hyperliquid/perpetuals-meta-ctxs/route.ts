import axios from 'axios'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/hyperliquid/perpetuals-meta-ctxs`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })
        return NextResponse.json(response.data, { status: 200 })
    } catch (error: unknown) {
        // Determine if error is an axios error with response
        const isAxiosError = axios.isAxiosError(error)
        const status = isAxiosError && error.response ? error.response.status : 500
        const errorMessage =
            isAxiosError && error.response
                ? error.response.data?.error || error.message
                : error instanceof Error
                ? error.message
                : 'Internal server error'

        return NextResponse.json({ error: errorMessage }, { status })
    }
}
