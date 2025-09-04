import axios from 'axios'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { tokenId } = body

        // Validate the tokenId parameter
        if (!tokenId || !/^0x[0-9a-fA-F]{32}$/.test(tokenId)) {
            return NextResponse.json({ error: 'Invalid token ID format' }, { status: 400 })
        }

        const response = await axios.post(
            `${process.env.BACKEND_API_URL}/hyperliquid/token-info`,
            {
                tokenId: tokenId,
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
        // Determine if error is an axios error with response
        const isAxiosError = error?.response !== undefined
        const status = isAxiosError ? error.response.status : 500
        const errorMessage = isAxiosError ? error.response.data || 'Request failed' : error.message || 'Internal server error'

        return NextResponse.json({ error: errorMessage }, { status })
    }
}
