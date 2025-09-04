import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async (request: NextRequest, { params }: { params: { newsId: string } }) => {
    const { newsId } = params
    const user = await getPrivyUser()

    const headers: Record<string, string | string[]> = {}
    headers['x-api-key'] = process.env.BACKEND_API_KEY!

    if (user) {
        headers.Authorization = `Bearer ${user.accessToken}`
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/feeds-news/${newsId}/indicators`, {
            headers,
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error: unknown) {
        console.log((error as { response?: unknown })?.response)
        const status = (error as { response?: { status: number } })?.response?.status || 500
        return NextResponse.json({ error: (error as Error).message }, { status })
    }
}
