import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get('page') ?? 1
    const limit = searchParams.get('limit') ?? 10
    const isPerps = searchParams.get('isPerps') ?? false

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/ats`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
            },
            params: {
                page,
                limit,
                isPublic: true,
                isPerps,
            },
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
