import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams

    const query = searchParams.get('query')

    if (!query) {
        return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/feeds/news`, {
            params: {
                query,
            },

            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
            },
        })

        return NextResponse.json(response.data, { status: 200 })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error?.response)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
