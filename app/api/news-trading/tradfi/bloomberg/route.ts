import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams
    const params: Record<string, string | string[]> = {}
    const user = await getPrivyUser()

    const headers: Record<string, string | string[]> = {}
    headers['x-api-key'] = process.env.BACKEND_API_KEY!

    if (user) {
        headers.Authorization = `Bearer ${user.accessToken}`
    }

    const page = searchParams.get('page')
    if (page) params.page = page

    const limit = searchParams.get('limit')
    if (limit) params.limit = limit

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/feeds-tradfi/bloomberg`, {
            params,
            paramsSerializer: params => {
                return Object.entries(params)
                    .map(([key, value]) =>
                        Array.isArray(value)
                            ? value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
                            : `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                    )
                    .join('&')
            },
            headers,
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
