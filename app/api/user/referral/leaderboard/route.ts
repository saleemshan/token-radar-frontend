import { NextResponse } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async () => {
    const user = await getPrivyUser()

    const headers: Record<string, string | string[]> = {}
    headers['x-api-key'] = process.env.REFERRAL_BACKEND_API_KEY!

    if (user) {
        headers.Authorization = `Bearer ${user.accessToken}`
    }

    try {
        const response = await axios.get(`${process.env.REFERRAL_BACKEND_API_URL}/user/leaderboard`, {
            headers,
        })
        // console.log('Leaderboard Data:', response.data)
        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
