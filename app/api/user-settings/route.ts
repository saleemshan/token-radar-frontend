import { NextResponse, NextRequest } from 'next/server'
import axios from 'axios'
import { getPrivyUser } from '@/utils/privyAuth'

export const GET = async () => {
    const user = await getPrivyUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const response = await axios.get(`${process.env.BACKEND_API_URL}/user-settings/${user.userId}`, {
            headers: {
                'x-api-key': process.env.BACKEND_API_KEY!,
                Authorization: `Bearer ${user.accessToken}`,
            },
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}

export const POST = async (request: NextRequest) => {
    const user = await getPrivyUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    try {
        const response = await axios.post(`${process.env.BACKEND_API_URL}/user-settings/${user.userId}`, body, {
            headers: {
                Authorization: `Bearer ${user.accessToken}`,
                'x-api-key': process.env.BACKEND_API_KEY!,
                'Content-Type': 'application/json',
            },
        })

        return NextResponse.json(response.data, { status: 200 })
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any).response?.status || 500
        return NextResponse.json({ error: error }, { status })
    }
}
