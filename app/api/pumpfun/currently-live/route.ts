import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters with defaults
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '48')
    const sort = searchParams.get('sort') || 'currently_live'
    const order = searchParams.get('order') || 'DESC'
    const includeNsfw = searchParams.get('includeNsfw') === 'true'

    // Validate parameters
    if (offset < 0) {
        return NextResponse.json({ code: 400, message: 'Offset must be non-negative' }, { status: 400 })
    }

    if (limit < 1 || limit > 100) {
        return NextResponse.json({ code: 400, message: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    if (!['ASC', 'DESC'].includes(order)) {
        return NextResponse.json({ code: 400, message: 'Order must be ASC or DESC' }, { status: 400 })
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/pumpfun/currently-live`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
            params: {
                offset,
                limit,
                sort,
                order,
                includeNsfw,
            },
        })

        return NextResponse.json(
            {
                code: 0,
                message: 'success',
                data: response.data.data,
            },
            { status: 200 }
        )
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error('PumpFun API Error:', error.response?.data)

            const status = error.response?.status || 500
            const errorMessage = error.response?.data?.message || 'Internal server error'

            return NextResponse.json({ code: status, message: errorMessage }, { status })
        }

        console.error('Unexpected error:', error)
        return NextResponse.json({ code: 500, message: 'Internal server error' }, { status: 500 })
    }
}
